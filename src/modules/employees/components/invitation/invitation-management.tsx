"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table/data-table";
import { Mail, MailPlus, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { authClient } from "@/server/auth/auth-client";

import { invitationColumns } from "./invitation-table-columns";
import { InvitationFilters } from "./invitation-filters";
import { InvitationDetailsDialog } from "./invitation-details-dialog";

import type {
  InvitationWithDetails,
  InvitationFilters as IInvitationFilters,
} from "../../types/invitation.types";
import { useDebounce } from "@/hooks/use-debounce";
import { EmployeeInviteDialog } from "./invite-employee-dialog";

const DEFAULT_FILTERS = {
  organizationId: "",
  search: undefined,
  status: "all" as const,
  sortBy: "createdAt" as const,
  sortDirection: "desc" as const,
};

const PAGE_SIZE = 10;

export function InvitationManagement() {
  const [filters, setFilters] = useState<IInvitationFilters>(DEFAULT_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedInvitation, setSelectedInvitation] =
    useState<InvitationWithDetails | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const [pendingActionId, setPendingActionId] = useState<string | undefined>();

  const debouncedSearch = useDebounce(filters.search, 300);
  const utils = api.useUtils();

  const { data: session } = authClient.useSession();
  const organizationId = session?.session?.activeOrganizationId;

  const invitationsQuery = api.invitation.list.useQuery(
    {
      organizationId: organizationId ?? "",
      limit: PAGE_SIZE,
      offset: (currentPage - 1) * PAGE_SIZE,
      searchQuery: debouncedSearch,
      status: filters.status,
      sortBy: filters.sortBy,
      sortDirection: filters.sortDirection,
    },
    {
      enabled: !!organizationId,
    },
  );

  // Mutations
  const cancelInvitation = api.invitation.cancel.useMutation({
    onMutate: (variables: { invitationId: string; organizationId: string }) => {
      setPendingActionId(variables.invitationId);
    },
    onSettled: () => {
      setPendingActionId(undefined);
    },
    onSuccess: () => {
      toast.success("Invitation cancelled successfully!");
      void utils.invitation.list.invalidate();
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message ?? "Failed to cancel invitation");
    },
  });

  const resendInvitation = api.invitation.resend.useMutation({
    onMutate: (variables: { invitationId: string; organizationId: string }) => {
      setPendingActionId(variables.invitationId);
    },
    onSettled: () => {
      setPendingActionId(undefined);
    },
    onSuccess: () => {
      toast.success("Invitation resent successfully!");
      void utils.invitation.list.invalidate();
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message ?? "Failed to resend invitation");
    },
  });

  // Event handlers
  const handleFiltersChange = useCallback((newFilters: IInvitationFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  const handleRefresh = useCallback(() => {
    void invitationsQuery.refetch();
  }, [invitationsQuery]);

  const handleViewInvitation = useCallback(
    (invitation: InvitationWithDetails) => {
      setSelectedInvitation(invitation);
      setDetailsDialogOpen(true);
    },
    [],
  );

  const handleCancelInvitation = useCallback(
    (invitation: InvitationWithDetails) => {
      if (!organizationId) return;

      cancelInvitation.mutate({
        invitationId: invitation.id,
        organizationId,
      });
    },
    [organizationId, cancelInvitation],
  );

  const handleResendInvitation = useCallback(
    (invitation: InvitationWithDetails) => {
      if (!organizationId) return;

      resendInvitation.mutate({
        invitationId: invitation.id,
        organizationId,
      });
    },
    [organizationId, resendInvitation],
  );

  const handleInviteSent = useCallback(() => {
    void utils.invitation.list.invalidate();
  }, [utils.invitation.list]);

  if (!organizationId) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="space-y-2 text-center">
            <AlertCircle className="text-muted-foreground mx-auto h-8 w-8" />
            <p className="text-muted-foreground">No organization selected</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (invitationsQuery.error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="space-y-4 text-center">
            <AlertCircle className="text-destructive mx-auto h-8 w-8" />
            <div>
              <p className="text-destructive font-medium">
                Error loading invitations
              </p>
              <p className="text-muted-foreground text-sm">
                {invitationsQuery.error.message}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => invitationsQuery.refetch()}
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const invitations = invitationsQuery.data?.invitations ?? [];
  const pagination = invitationsQuery.data?.pagination;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Invitation Management
          </h1>
          <p className="text-muted-foreground">
            Manage and track all organization invitations
          </p>
        </div>
        <EmployeeInviteDialog
          onInviteSent={handleInviteSent}
          triggerButton={
            <Button>
              <MailPlus className="mr-2 h-4 w-4" />
              Send Invitation
            </Button>
          }
        />
      </div>

      {/* Stats Card */}
      {pagination && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Mail className="h-5 w-5" />
              Invitation Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {pagination.totalCount}
                </div>
                <div className="text-muted-foreground text-sm">
                  Total Invitations
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {invitations.filter((i) => i.status === "pending").length}
                </div>
                <div className="text-muted-foreground text-sm">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {invitations.filter((i) => i.status === "accepted").length}
                </div>
                <div className="text-muted-foreground text-sm">Accepted</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {
                    invitations.filter(
                      (i) =>
                        i.status === "canceled" ||
                        new Date(i.expiresAt) < new Date(),
                    ).length
                  }
                </div>
                <div className="text-muted-foreground text-sm">
                  Canceled/Expired
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Filters</CardTitle>
          <CardDescription>
            Search and filter invitations by email, status, or other criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InvitationFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onRefresh={handleRefresh}
            isLoading={invitationsQuery.isLoading}
          />
        </CardContent>
      </Card>

      {/* Invitation Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invitations</CardTitle>
          <CardDescription>
            {pagination
              ? `Showing ${invitations.length} of ${pagination.totalCount} invitations`
              : "Loading invitations..."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={invitationColumns}
            data={invitations}
            meta={{
              onViewInvitation: handleViewInvitation,
              onCancelInvitation: handleCancelInvitation,
              onResendInvitation: handleResendInvitation,
              isLoading:
                Boolean(cancelInvitation.isPending) ||
                Boolean(resendInvitation.isPending),
              pendingActionId,
            }}
          />
        </CardContent>
      </Card>

      {/* Dialogs */}
      <InvitationDetailsDialog
        invitation={selectedInvitation}
        isOpen={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
      />
    </div>
  );
}
