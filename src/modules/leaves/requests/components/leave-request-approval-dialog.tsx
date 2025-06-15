"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LEAVE_TYPES } from "../../constants";
import { format } from "date-fns";
import type { LeaveRequestWithEmployee } from "../../types";

type LeaveRequestApprovalDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRequest: LeaveRequestWithEmployee | null;
  approvalAction: "approved" | "rejected";
  onConfirm: (rejectionReason?: string) => void;
  isLoading: boolean;
};

export function LeaveRequestApprovalDialog({
  open,
  onOpenChange,
  selectedRequest,
  approvalAction,
  onConfirm,
  isLoading,
}: LeaveRequestApprovalDialogProps) {
  const [rejectionReason, setRejectionReason] = useState("");

  const handleConfirm = () => {
    onConfirm(approvalAction === "rejected" ? rejectionReason : undefined);
    setRejectionReason("");
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setRejectionReason("");
    }
    onOpenChange(newOpen);
  };

  if (!selectedRequest) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {approvalAction === "approved" ? "Approve" : "Reject"} Leave Request
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to{" "}
            {approvalAction === "approved" ? "approve" : "reject"} this leave
            request?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="font-medium">Employee</Label>
              <div>
                {selectedRequest.employee?.user?.name ??
                  selectedRequest.employee?.designation ??
                  "N/A"}
              </div>
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

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={
              isLoading ||
              (approvalAction === "rejected" && !rejectionReason.trim())
            }
            variant={approvalAction === "approved" ? "default" : "destructive"}
          >
            {isLoading
              ? "Processing..."
              : approvalAction === "approved"
                ? "Approve"
                : "Reject"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
