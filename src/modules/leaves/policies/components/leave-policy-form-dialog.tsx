"use client";

import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LEAVE_TYPES, type LeaveType } from "../../constants";

type PolicyFormData = {
  leaveType: LeaveType;
  defaultAllowance: number;
  carryForward: boolean;
  maxCarryForward: number;
};

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

type LeavePolicyFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPolicy: LeavePolicy | null;
  onSubmit: (data: PolicyFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
};

export function LeavePolicyFormDialog({
  open,
  onOpenChange,
  selectedPolicy,
  onSubmit,
  onCancel,
  isSubmitting,
}: LeavePolicyFormDialogProps) {
  const form = useForm<PolicyFormData>({
    defaultValues: {
      leaveType: selectedPolicy?.leaveType ?? "annual",
      defaultAllowance: selectedPolicy?.defaultAllowance ?? 0,
      carryForward: selectedPolicy?.carryForward ?? false,
      maxCarryForward: selectedPolicy?.maxCarryForward ?? 0,
    },
  });

  // Reset form when selectedPolicy changes
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      form.reset({
        leaveType: "annual",
        defaultAllowance: 0,
        carryForward: false,
        maxCarryForward: 0,
      });
    } else if (selectedPolicy) {
      form.reset({
        leaveType: selectedPolicy.leaveType,
        defaultAllowance: selectedPolicy.defaultAllowance,
        carryForward: selectedPolicy.carryForward,
        maxCarryForward: selectedPolicy.maxCarryForward ?? 0,
      });
    }
    onOpenChange(isOpen);
  };

  const handleSubmit = (data: PolicyFormData) => {
    onSubmit(data);
    form.reset();
  };

  const handleCancel = () => {
    form.reset();
    onCancel();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {selectedPolicy ? "Edit" : "Create"} Leave Policy
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="leaveType">Leave Type</Label>
            <Select
              value={form.watch("leaveType")}
              onValueChange={(value) =>
                form.setValue("leaveType", value as PolicyFormData["leaveType"])
              }
              disabled={!!selectedPolicy} // Disable leave type editing for existing policies
            >
              <SelectTrigger>
                <SelectValue placeholder="Select leave type" />
              </SelectTrigger>
              <SelectContent>
                {LEAVE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <span>{type.icon}</span>
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedPolicy && (
              <p className="text-muted-foreground text-xs">
                Leave type cannot be changed for existing policies
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultAllowance">Allowed Days per Year</Label>
            <Input
              id="defaultAllowance"
              type="number"
              min="0"
              max="365"
              {...form.register("defaultAllowance", {
                valueAsNumber: true,
                required: "Default allowance is required",
                min: { value: 0, message: "Must be at least 0" },
                max: { value: 365, message: "Cannot exceed 365 days" },
              })}
            />
            {form.formState.errors.defaultAllowance && (
              <p className="text-xs text-red-500">
                {form.formState.errors.defaultAllowance.message}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="carryForward"
              {...form.register("carryForward")}
              className="rounded border-gray-300"
            />
            <Label htmlFor="carryForward">
              Allow carry forward to next year
            </Label>
          </div>

          {form.watch("carryForward") && (
            <div className="space-y-2">
              <Label htmlFor="maxCarryForward">Max Days to Carry Forward</Label>
              <Input
                id="maxCarryForward"
                type="number"
                min="0"
                max={form.watch("defaultAllowance") || 365}
                {...form.register("maxCarryForward", {
                  valueAsNumber: true,
                  required: form.watch("carryForward")
                    ? "Max carry forward is required when carry forward is enabled"
                    : false,
                  min: { value: 0, message: "Must be at least 0" },
                  max: {
                    value: form.watch("defaultAllowance") || 365,
                    message: "Cannot exceed the default allowance",
                  },
                })}
              />
              {form.formState.errors.maxCarryForward && (
                <p className="text-xs text-red-500">
                  {form.formState.errors.maxCarryForward.message}
                </p>
              )}
              <p className="text-muted-foreground text-xs">
                Maximum days that can be carried forward to the next year
              </p>
            </div>
          )}

          {!selectedPolicy && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
              <div className="flex items-start gap-2">
                <div className="text-sm">
                  <p className="font-medium text-blue-900">
                    📋 Automatic Balance Initialization
                  </p>
                  <p className="mt-1 text-blue-700">
                    When you create this policy, leave balances will be
                    automatically initialized for all existing active employees
                    based on the default allowance.
                  </p>
                </div>
              </div>
            </div>
          )}

          {selectedPolicy && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <div className="flex items-start gap-2">
                <div className="text-sm">
                  <p className="font-medium text-amber-900">
                    ⚡ Smart Balance Updates
                  </p>
                  <p className="mt-1 text-amber-700">
                    If you change the allowed days per year, existing employee
                    balances will be automatically updated to reflect the new
                    allowance. This ensures all employees get the benefits of
                    policy improvements immediately.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? selectedPolicy
                  ? "Updating..."
                  : "Creating..."
                : selectedPolicy
                  ? "Update Policy"
                  : "Create Policy"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
