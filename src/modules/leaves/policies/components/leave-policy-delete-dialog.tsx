"use client";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2, Settings, Calendar, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { Badge } from "@/components/ui/badge";
import { type LeaveType } from "../../constants";

type LeavePolicy = {
  id: string;
  leaveType: LeaveType;
  defaultAllowance: number;
  carryForward: boolean;
  maxCarryForward: number | null;
  isActive: boolean;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

interface LeavePolicyDeleteDialogProps {
  policy: LeavePolicy | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onPolicyDeleted?: () => void;
}

export function LeavePolicyDeleteDialog({
  policy,
  isOpen,
  onOpenChange,
  onPolicyDeleted,
}: LeavePolicyDeleteDialogProps) {
  const utils = api.useUtils();

  const deletePolicy = api.leave.deleteLeavePolicy.useMutation({
    onSuccess: () => {
      toast.success("Leave policy deleted successfully!");
      void utils.leave.getLeavePolicies.invalidate();
      onPolicyDeleted?.();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to delete leave policy");
    },
  });

  const handleDelete = () => {
    if (!policy) return;

    deletePolicy.mutate({
      id: policy.id,
    });
  };

  if (!policy) {
    return null;
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="text-destructive h-5 w-5" />
            Delete Leave Policy
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                Are you sure you want to delete this leave policy? This action
                cannot be undone and will affect all employee leave balances.
              </p>

              <div className="bg-muted/50 rounded-lg border p-3">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Settings className="text-muted-foreground mt-0.5 h-5 w-5 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium capitalize">
                          {policy.leaveType.replace("_", " ")}
                        </h4>
                        <Badge
                          variant={policy.isActive ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {policy.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>

                      <div className="text-muted-foreground space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          <span>
                            Default Allowance: {policy.defaultAllowance} days
                          </span>
                        </div>

                        {policy.carryForward ? (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            <span>
                              Carry Forward: Up to{" "}
                              {policy.maxCarryForward || "unlimited"} days
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            <span>No carry forward allowed</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/20">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-800 dark:text-amber-200">
                      Impact on Employee Balances
                    </p>
                    <p className="mt-1 text-amber-700 dark:text-amber-300">
                      Deleting this policy will remove all associated employee
                      leave balances and cannot be recovered. Employees will
                      lose their current leave allocations for this leave type.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deletePolicy.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant="destructive"
              disabled={deletePolicy.isPending}
              onClick={handleDelete}
            >
              {deletePolicy.isPending ? "Deleting..." : "Yes, delete policy"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
