"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Check, X } from "lucide-react";
import { LEAVE_TYPES, LEAVE_STATUSES } from "../../constants";
import { format } from "date-fns";
import { Can } from "@/components/can";
import type { LeaveRequestWithEmployee } from "../../types";

type LeaveRequestViewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRequest: LeaveRequestWithEmployee | null;
  onApprove: () => void;
  onReject: () => void;
};

export function LeaveRequestViewDialog({
  open,
  onOpenChange,
  selectedRequest,
  onApprove,
  onReject,
}: LeaveRequestViewDialogProps) {
  const getStatusBadge = (status: string) => {
    const config = LEAVE_STATUSES[status as keyof typeof LEAVE_STATUSES];
    if (!config) return null;

    return (
      <Badge className={config.color}>
        {config.icon}
        <span className="ml-1">{config.label}</span>
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = LEAVE_TYPES.find((t) => t.value === type);
    if (!typeConfig) return type;

    return (
      <div className="flex items-center gap-1">
        <span>{typeConfig.icon}</span>
        <span>{typeConfig.label}</span>
      </div>
    );
  };

  if (!selectedRequest) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Leave Request Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Employee Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground text-sm font-medium">
                  Employee
                </Label>
                <div className="font-medium">
                  {selectedRequest.employee?.user?.name ??
                    selectedRequest.employee?.designation ??
                    "N/A"}
                </div>
                <div className="text-muted-foreground text-sm">
                  {selectedRequest.employee?.user?.email ?? ""}
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground text-sm font-medium">
                  Status
                </Label>
                <div className="mt-1">
                  {getStatusBadge(selectedRequest.status)}
                </div>
              </div>
            </div>
          </div>

          {/* Leave Details */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground text-sm font-medium">
                  Leave Type
                </Label>
                <div>{getTypeBadge(selectedRequest.leaveType)}</div>
              </div>
              <div>
                <Label className="text-muted-foreground text-sm font-medium">
                  Duration
                </Label>
                <div className="font-medium">
                  {selectedRequest.totalDays} day
                  {selectedRequest.totalDays !== 1 ? "s" : ""}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground text-sm font-medium">
                  Start Date
                </Label>
                <div>{format(new Date(selectedRequest.startDate), "PPP")}</div>
              </div>
              <div>
                <Label className="text-muted-foreground text-sm font-medium">
                  End Date
                </Label>
                <div>{format(new Date(selectedRequest.endDate), "PPP")}</div>
              </div>
            </div>
          </div>

          {/* Reason */}
          <div>
            <Label className="text-muted-foreground text-sm font-medium">
              Reason
            </Label>
            <div className="bg-muted mt-2 rounded-lg p-3">
              {selectedRequest.reason}
            </div>
          </div>

          {/* Request Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground text-sm font-medium">
                Applied On
              </Label>
              <div>{format(new Date(selectedRequest.createdAt), "PPP")}</div>
            </div>
            {selectedRequest.updatedAt && (
              <div>
                <Label className="text-muted-foreground text-sm font-medium">
                  Last Updated
                </Label>
                <div>{format(new Date(selectedRequest.updatedAt), "PPP")}</div>
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

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Can I="update"  a="LeaveRequests">
            {selectedRequest.status === "pending" && (
              <>
                <Button
                  onClick={onApprove}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Approve
                </Button>
                <Button variant="destructive" onClick={onReject}>
                  <X className="mr-2 h-4 w-4" />
                  Reject
                </Button>
              </>
            )}
          </Can>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
