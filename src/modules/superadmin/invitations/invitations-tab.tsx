"use client";

import { useCallback, useState } from "react";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { columns } from "./invitation-columns";
import { DataTable } from "@/components/ui/data-table/data-table";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { CancelInvitationDialog } from "./cancel-invitation-dialog";
import type { Invitation } from "./invitation-columns";

interface InvitationsTabProps {
  limit?: number;
}

export function InvitationsTab({ limit }: InvitationsTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInvitation, setSelectedInvitation] =
    useState<Invitation | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const utils = api.useUtils();
  const listInvitationsQuery = api.admin.listInvitations.useQuery({
    limit: limit ?? 10,
    offset: 0,
    searchQuery,
    sortBy: "createdAt",
    sortDirection: "desc",
    status: "all",
  });

  const cancelInvitation = api.admin.cancelInvitation.useMutation({
    onSuccess: () => {
      void utils.admin.listInvitations.invalidate();
      toast.success("Invitation cancelled successfully!");
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleCancelInvitation = useCallback(
    async (invitationId: string) => {
      cancelInvitation.mutate({ invitationId });
    },
    [cancelInvitation],
  );

  const openCancelDialog = useCallback((invitation: Invitation) => {
    setSelectedInvitation(invitation);
    setIsDialogOpen(true);
  }, []);

  if (listInvitationsQuery.error) {
    return (
      <div className="border-destructive/50 bg-destructive/10 rounded-lg border p-4">
        <div className="flex flex-col space-y-2">
          <p className="text-destructive text-sm font-medium">
            Error loading invitations
          </p>
          <p className="text-destructive text-xs">
            {listInvitationsQuery.error.message}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => listInvitationsQuery.refetch()}
            className="text-destructive w-fit"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Input
            placeholder="Filter invitations..."
            className="max-w-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => listInvitationsQuery.refetch()}
            className="ml-2"
            disabled={listInvitationsQuery.isLoading}
          >
            <RefreshCw
              className={cn(
                "h-4 w-4",
                listInvitationsQuery.isLoading && "animate-spin",
              )}
            />
            <span className="sr-only ml-2">Refresh</span>
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={listInvitationsQuery.data?.invitations ?? []}
          meta={{
            openCancelDialog: openCancelDialog,
            isCancelling: cancelInvitation.isPending,
            pendingCancelId: cancelInvitation.variables?.invitationId,
          }}
        />
      </div>

      <CancelInvitationDialog
        invitation={selectedInvitation}
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onConfirm={handleCancelInvitation}
        isLoading={cancelInvitation.isPending}
      />
    </>
  );
}
