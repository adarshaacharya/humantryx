"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MoreHorizontal, Check, X, Eye, Calendar, Search } from "lucide-react";
import { LEAVE_TYPES, LEAVE_STATUSES } from "../../constants";
import { format } from "date-fns";
import { toast } from "sonner";
import { CustomDataTablePagination } from "./custom-data-table-pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  LeaveRequestWithEmployee,
  LeaveStatus,
  LeaveType,
} from "../../types";

type LeaveRequestsTableProps = {
  showFilters?: boolean;
  employeeId?: string;
};

export function LeaveRequestsTable({
  showFilters = true,
  employeeId,
}: LeaveRequestsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<LeaveStatus>("pending");
  const [typeFilter, setTypeFilter] = useState<LeaveType>("annual");
  const [searchTerm, setSearchTerm] = useState("");

  // Dialog states
  const [selectedRequest, setSelectedRequest] =
    useState<LeaveRequestWithEmployee | null>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [approvalAction, setApprovalAction] = useState<"approved" | "rejected">(
    "approved",
  );
  const [rejectionReason, setRejectionReason] = useState("");

  const leaveRequestsQuery = api.leave.list.useQuery({
    page: currentPage,
    limit: pageSize,
    employeeId,
    status: statusFilter || undefined,
    leaveType: typeFilter || undefined,
  });

  const updateStatusMutation = api.leave.updateStatus.useMutation({
    onSuccess: () => {
      toast.success(`Leave request ${approvalAction} successfully`);
      setShowApprovalDialog(false);
      setSelectedRequest(null);
      setRejectionReason("");
      void leaveRequestsQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleStatusUpdate = () => {
    if (!selectedRequest) return;

    updateStatusMutation.mutate({
      id: selectedRequest.id,
      status: approvalAction,
      rejectionReason:
        approvalAction === "rejected" ? rejectionReason : undefined,
    });
  };

  const canManageRequests = true; // TODO: Check user role

  if (leaveRequestsQuery.isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Leave Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">Loading leave requests...</div>
        </CardContent>
      </Card>
    );
  }

  if (leaveRequestsQuery.isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Leave Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-red-600">
            Failed to load leave requests
          </div>
        </CardContent>
      </Card>
    );
  }

  const { data: requests = [], pagination } = leaveRequestsQuery.data ?? {};

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Leave Requests
            </CardTitle>
          </div>

          {showFilters && (
            <div className="mt-4 flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Search className="text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>

              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as LeaveStatus)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {Object.entries(LEAVE_STATUSES).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={typeFilter}
                onValueChange={(value) => setTypeFilter(value as LeaveType)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {LEAVE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardHeader>

        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-muted-foreground py-8 text-center"
                    >
                      No leave requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  requests.map((request: LeaveRequestWithEmployee) => {
                    const leaveConfig = LEAVE_TYPES.find(
                      (type) => type.value === request.leaveType,
                    );
                    const statusConfig =
                      LEAVE_STATUSES[
                        request.status as keyof typeof LEAVE_STATUSES
                      ];

                    return (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div className="font-medium">
                            {request.employee?.user?.name ?? "Unknown"}
                          </div>
                          <div className="text-muted-foreground text-sm">
                            {request.employee?.user?.email ?? ""}
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant="outline"
                            className={leaveConfig?.color}
                          >
                            <span className="mr-1">{leaveConfig?.icon}</span>
                            {leaveConfig?.label}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <div className="text-sm">
                            {format(new Date(request.startDate), "MMM dd")} -{" "}
                            {format(new Date(request.endDate), "MMM dd, yyyy")}
                          </div>
                        </TableCell>

                        <TableCell>
                          <span className="font-medium">
                            {request.totalDays}
                          </span>
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant="outline"
                            className={statusConfig?.color}
                          >
                            <span className="mr-1">{statusConfig?.icon}</span>
                            {statusConfig?.label}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <div className="text-muted-foreground text-sm">
                            {format(
                              new Date(request.createdAt),
                              "MMM dd, yyyy",
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => setSelectedRequest(request)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>

                              {canManageRequests &&
                                request.status === "pending" && (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedRequest(request);
                                        setApprovalAction("approved");
                                        setShowApprovalDialog(true);
                                      }}
                                    >
                                      <Check className="mr-2 h-4 w-4 text-green-600" />
                                      Approve
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedRequest(request);
                                        setApprovalAction("rejected");
                                        setShowApprovalDialog(true);
                                      }}
                                    >
                                      <X className="mr-2 h-4 w-4 text-red-600" />
                                      Reject
                                    </DropdownMenuItem>
                                  </>
                                )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {pagination && (
            <CustomDataTablePagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalCount}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
            />
          )}
        </CardContent>
      </Card>

      {/* Approval/Rejection Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {approvalAction === "approved" ? "Approve" : "Reject"} Leave
              Request
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to{" "}
              {approvalAction === "approved" ? "approve" : "reject"} this leave
              request?
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="font-medium">Employee</Label>
                  <div>{selectedRequest.employee?.user?.name}</div>
                </div>
                <div>
                  <Label className="font-medium">Leave Type</Label>
                  <div>
                    {
                      LEAVE_TYPES.find(
                        (type) => type.value === selectedRequest.leaveType,
                      )?.label
                    }
                  </div>
                </div>
                <div>
                  <Label className="font-medium">Duration</Label>
                  <div>{selectedRequest.totalDays} days</div>
                </div>
                <div>
                  <Label className="font-medium">Dates</Label>
                  <div>
                    {format(new Date(selectedRequest.startDate), "MMM dd")} -{" "}
                    {format(new Date(selectedRequest.endDate), "MMM dd, yyyy")}
                  </div>
                </div>
              </div>

              <div>
                <Label className="font-medium">Reason</Label>
                <div className="bg-muted mt-1 rounded p-2 text-sm">
                  {selectedRequest.reason}
                </div>
              </div>

              {approvalAction === "rejected" && (
                <div className="space-y-2">
                  <Label htmlFor="rejection-reason">Rejection Reason *</Label>
                  <Textarea
                    id="rejection-reason"
                    placeholder="Please provide a reason for rejection..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowApprovalDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStatusUpdate}
              disabled={
                updateStatusMutation.isPending ||
                (approvalAction === "rejected" && !rejectionReason.trim())
              }
              variant={
                approvalAction === "approved" ? "default" : "destructive"
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
    </>
  );
}
