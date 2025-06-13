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
  const [showViewDialog, setShowViewDialog] = useState(false);
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
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setShowViewDialog(true);
                                }}
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

      {/* View Details Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Leave Request Details</DialogTitle>
            <DialogDescription>
              Complete information about this leave request
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6">
              {/* Employee Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <Label className="text-muted-foreground text-sm font-medium">
                      Employee
                    </Label>
                    <div className="font-medium">
                      {selectedRequest.employee?.user?.name ?? "Unknown"}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      {selectedRequest.employee?.user?.email ?? ""}
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-sm font-medium">
                      Designation
                    </Label>
                    <div className="capitalize">
                      {selectedRequest.employee?.designation?.replace(
                        "_",
                        " ",
                      ) ?? "N/A"}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label className="text-muted-foreground text-sm font-medium">
                      Leave Type
                    </Label>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={
                          LEAVE_TYPES.find(
                            (type) => type.value === selectedRequest.leaveType,
                          )?.color
                        }
                      >
                        <span className="mr-1">
                          {
                            LEAVE_TYPES.find(
                              (type) =>
                                type.value === selectedRequest.leaveType,
                            )?.icon
                          }
                        </span>
                        {
                          LEAVE_TYPES.find(
                            (type) => type.value === selectedRequest.leaveType,
                          )?.label
                        }
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-sm font-medium">
                      Status
                    </Label>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={
                          LEAVE_STATUSES[
                            selectedRequest.status as keyof typeof LEAVE_STATUSES
                          ]?.color
                        }
                      >
                        <span className="mr-1">
                          {
                            LEAVE_STATUSES[
                              selectedRequest.status as keyof typeof LEAVE_STATUSES
                            ]?.icon
                          }
                        </span>
                        {
                          LEAVE_STATUSES[
                            selectedRequest.status as keyof typeof LEAVE_STATUSES
                          ]?.label
                        }
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Leave Duration */}
              <div className="grid grid-cols-3 gap-4 rounded-lg border p-4">
                <div>
                  <Label className="text-muted-foreground text-sm font-medium">
                    Start Date
                  </Label>
                  <div className="font-medium">
                    {format(new Date(selectedRequest.startDate), "PPP")}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground text-sm font-medium">
                    End Date
                  </Label>
                  <div className="font-medium">
                    {format(new Date(selectedRequest.endDate), "PPP")}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground text-sm font-medium">
                    Total Days
                  </Label>
                  <div className="text-primary text-2xl font-bold">
                    {selectedRequest.totalDays}
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div>
                <Label className="text-muted-foreground text-sm font-medium">
                  Reason for Leave
                </Label>
                <div className="bg-muted/50 mt-2 rounded-lg border p-3 text-sm">
                  {selectedRequest.reason}
                </div>
              </div>

              {/* Request Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-sm font-medium">
                    Applied On
                  </Label>
                  <div>
                    {format(new Date(selectedRequest.createdAt), "PPP")}
                  </div>
                </div>
                {selectedRequest.updatedAt && (
                  <div>
                    <Label className="text-muted-foreground text-sm font-medium">
                      Last Updated
                    </Label>
                    <div>
                      {format(new Date(selectedRequest.updatedAt), "PPP")}
                    </div>
                  </div>
                )}
              </div>

              {/* Approval Information */}
              {(selectedRequest.status === "approved" ||
                selectedRequest.status === "rejected") && (
                <div className="bg-muted/20 rounded-lg border p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground text-sm font-medium">
                        {selectedRequest.status === "approved"
                          ? "Approved By"
                          : "Rejected By"}
                      </Label>
                      <div className="font-medium">
                        {selectedRequest.approver?.user?.name ?? "N/A"}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        {selectedRequest.approver?.user?.email ?? ""}
                      </div>
                    </div>
                    {selectedRequest.approvedAt && (
                      <div>
                        <Label className="text-muted-foreground text-sm font-medium">
                          {selectedRequest.status === "approved"
                            ? "Approved On"
                            : "Rejected On"}
                        </Label>
                        <div>
                          {format(new Date(selectedRequest.approvedAt), "PPP")}
                        </div>
                      </div>
                    )}
                  </div>
                  {selectedRequest.rejectionReason && (
                    <div className="mt-3">
                      <Label className="text-muted-foreground text-sm font-medium">
                        Rejection Reason
                      </Label>
                      <div className="mt-1 rounded bg-red-50 p-2 text-sm text-red-700">
                        {selectedRequest.rejectionReason}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
            {canManageRequests && selectedRequest?.status === "pending" && (
              <>
                <Button
                  onClick={() => {
                    setShowViewDialog(false);
                    setApprovalAction("approved");
                    setShowApprovalDialog(true);
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setShowViewDialog(false);
                    setApprovalAction("rejected");
                    setShowApprovalDialog(true);
                  }}
                >
                  <X className="mr-2 h-4 w-4" />
                  Reject
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
