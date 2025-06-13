"use client";

import { useState, useCallback } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table/data-table";
import { AlertCircle } from "lucide-react";
import { authClient } from "@/server/auth/auth-client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

import { leaveRequestColumns } from "./leave-requests-table-columns";
import {
  LeaveFiltersComponent,
  type LeaveFilters,
} from "./leave-filters";
import type { LeaveRequest } from "../../types";

const DEFAULT_FILTERS: LeaveFilters = {
  search: undefined,
  status: undefined,
  leaveType: undefined,
  sortBy: "createdAt",
  sortDirection: "desc",
};

const PAGE_SIZE = 10;

interface LeaveRequestsDataTableProps {
  employeeId?: string;
  userRole?: "hr" | "employee";
  showFilters?: boolean;
}

export function LeaveRequestsDataTable({
  employeeId,
  userRole = "employee",
  showFilters = true,
}: LeaveRequestsDataTableProps) {
  const [localFilters, setLocalFilters] =
    useState<LeaveFilters>(DEFAULT_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(
    null,
  );
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [approvalAction, setApprovalAction] = useState<"approved" | "rejected">(
    "approved",
  );
  const [rejectionReason, setRejectionReason] = useState("");
  const [pendingActionId, setPendingActionId] = useState<string | undefined>();

  const filters = localFilters;

  const { data: session } = authClient.useSession();
  const organizationId = session?.session?.activeOrganizationId;

  const leaveRequestsQuery = api.leave.list.useQuery(
    {
      page: currentPage,
      limit: PAGE_SIZE,
      employeeId,
      status: filters.status as
        | "pending"
        | "rejected"
        | "approved"
        | "cancelled"
        | undefined,
      leaveType: filters.leaveType as
        | "annual"
        | "sick"
        | "casual"
        | "maternity"
        | "paternity"
        | "emergency"
        | undefined,
    },
    {
      enabled: !!organizationId,
    },
  );

  const updateStatusMutation = api.leave.updateStatus.useMutation({
    onSuccess: () => {
      toast.success(`Leave request ${approvalAction} successfully`);
      setApprovalDialogOpen(false);
      setSelectedRequest(null);
      setRejectionReason("");
      setPendingActionId(undefined);
      void leaveRequestsQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message);
      setPendingActionId(undefined);
    },
  });

  // Event handlers
  const handleFiltersChange = useCallback((newFilters: LeaveFilters) => {
    setLocalFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  const handleRefresh = useCallback(() => {
    void leaveRequestsQuery.refetch();
  }, [leaveRequestsQuery]);

  const handleViewRequest = useCallback((request: LeaveRequest) => {
    setSelectedRequest(request);
    setViewDialogOpen(true);
  }, []);

  const handleApproveRequest = useCallback((request: LeaveRequest) => {
    setSelectedRequest(request);
    setApprovalAction("approved");
    setApprovalDialogOpen(true);
  }, []);

  const handleRejectRequest = useCallback((request: LeaveRequest) => {
    setSelectedRequest(request);
    setApprovalAction("rejected");
    setApprovalDialogOpen(true);
  }, []);

  const handleStatusUpdate = () => {
    if (!selectedRequest) return;

    setPendingActionId(selectedRequest.id);
    updateStatusMutation.mutate({
      id: selectedRequest.id,
      status: approvalAction,
      rejectionReason:
        approvalAction === "rejected" ? rejectionReason : undefined,
    });
  };

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

  if (leaveRequestsQuery.error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="space-y-4 text-center">
            <AlertCircle className="text-destructive mx-auto h-8 w-8" />
            <div>
              <p className="text-destructive font-medium">
                Error loading leave requests
              </p>
              <p className="text-muted-foreground text-sm">
                {leaveRequestsQuery.error.message}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => leaveRequestsQuery.refetch()}
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const leaveRequests = leaveRequestsQuery.data?.data ?? [];
  const pagination = leaveRequestsQuery.data?.pagination;

  return (
    <div className="space-y-6">
      {/* Filters */}
      {showFilters && (
        <LeaveFiltersComponent
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onRefresh={handleRefresh}
          isLoading={leaveRequestsQuery.isLoading}
          showStatusFilter={userRole === "hr"}
          showTypeFilter={true}
        />
      )}

      {/* Leave Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Leave Requests</CardTitle>
          <CardDescription>
            {pagination
              ? `Showing ${leaveRequests.length} of ${pagination.totalCount} leave requests`
              : "Loading leave requests..."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={leaveRequestColumns}
            data={leaveRequests}
            meta={{
              onViewRequest: handleViewRequest,
              onApproveRequest: handleApproveRequest,
              onRejectRequest: handleRejectRequest,
              pendingActionId,
              isLoading: updateStatusMutation.isPending,
              userRole,
            }}
          />
        </CardContent>
      </Card>

      {/* View Request Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Leave Request Details</DialogTitle>
            <DialogDescription>
              View detailed information about this leave request
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Employee</Label>
                  <p className="text-sm">
                    {selectedRequest.employee?.designation ?? "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Leave Type</Label>
                  <p className="text-sm capitalize">
                    {selectedRequest.leaveType}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Start Date</Label>
                  <p className="text-sm">
                    {new Date(selectedRequest.startDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">End Date</Label>
                  <p className="text-sm">
                    {new Date(selectedRequest.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Total Days</Label>
                  <p className="text-sm">{selectedRequest.totalDays}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <p className="text-sm capitalize">{selectedRequest.status}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Reason</Label>
                <p className="mt-1 text-sm">{selectedRequest.reason}</p>
              </div>

              {selectedRequest.rejectionReason && (
                <div>
                  <Label className="text-sm font-medium">
                    Rejection Reason
                  </Label>
                  <p className="mt-1 text-sm">
                    {selectedRequest.rejectionReason}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approval/Rejection Dialog */}
      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {approvalAction === "approved" ? "Approve" : "Reject"} Leave
              Request
            </DialogTitle>
            <DialogDescription>
              {approvalAction === "approved"
                ? "Are you sure you want to approve this leave request?"
                : "Please provide a reason for rejecting this leave request."}
            </DialogDescription>
          </DialogHeader>

          {approvalAction === "rejected" && (
            <div className="space-y-2">
              <Label htmlFor="rejectionReason">Rejection Reason</Label>
              <Textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a reason for rejection..."
                rows={3}
              />
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setApprovalDialogOpen(false)}
              disabled={updateStatusMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant={
                approvalAction === "approved" ? "default" : "destructive"
              }
              onClick={handleStatusUpdate}
              disabled={
                updateStatusMutation.isPending ||
                (approvalAction === "rejected" && !rejectionReason.trim())
              }
            >
              {updateStatusMutation.isPending
                ? "Processing..."
                : approvalAction === "approved"
                  ? "Approve"
                  : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
