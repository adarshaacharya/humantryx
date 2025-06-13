"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { authClient } from "@/server/auth/auth-client";

import { LEAVE_TYPES } from "../../constants";

const adjustBalanceSchema = z.object({
  employeeId: z.string().uuid("Please select an employee"),
  leaveType: z.enum(
    ["annual", "sick", "casual", "maternity", "paternity", "emergency"],
    {
      required_error: "Please select a leave type",
    },
  ),
  adjustment: z
    .number()
    .min(-365, "Adjustment cannot be less than -365")
    .max(365, "Adjustment cannot be more than 365"),
  reason: z.string().min(5, "Reason must be at least 5 characters"),
});

type AdjustBalanceForm = z.infer<typeof adjustBalanceSchema>;

interface AdjustLeaveBalanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AdjustLeaveBalanceDialog({
  open,
  onOpenChange,
  onSuccess,
}: AdjustLeaveBalanceDialogProps) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");

  const { data: session } = authClient.useSession();
  const organizationId = session?.session?.activeOrganizationId;

  const form = useForm<AdjustBalanceForm>({
    resolver: zodResolver(adjustBalanceSchema),
    defaultValues: {
      employeeId: "",
      leaveType: "annual",
      adjustment: 0,
      reason: "",
    },
  });

  // Fetch employees for selection
  const employeesQuery = api.employee.list.useQuery(
    {
      organizationId: organizationId ?? "",
      limit: 100, // Get more employees for selection
      offset: 0,
    },
    {
      enabled: !!organizationId && open,
    },
  );

  // Fetch leave balance for selected employee
  const leaveBalancesQuery = api.leave.getBalances.useQuery(
    {
      employeeId: selectedEmployeeId,
    },
    {
      enabled: !!selectedEmployeeId && open,
    },
  );

  const adjustBalanceMutation = api.leave.adjustBalance.useMutation({
    onSuccess: () => {
      toast.success("Leave balance adjusted successfully");
      onOpenChange(false);
      form.reset();
      setSelectedEmployeeId("");
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: AdjustBalanceForm) => {
    adjustBalanceMutation.mutate({
      employeeId: data.employeeId,
      leaveType: data.leaveType,
      adjustment: data.adjustment,
      reason: data.reason,
    });
  };

  const handleEmployeeChange = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    form.setValue("employeeId", employeeId);
  };

  const handleDialogOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
      setSelectedEmployeeId("");
    }
    onOpenChange(newOpen);
  };

  const employees = employeesQuery.data?.employees ?? [];
  const selectedEmployee = employees.find(
    (emp) => emp.id === selectedEmployeeId,
  );
  const leaveBalances = leaveBalancesQuery.data ?? [];

  // Get current balance for selected leave type
  const selectedLeaveType = form.watch("leaveType");
  const currentBalance = leaveBalances.find(
    (balance) => balance.leaveType === selectedLeaveType,
  );

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust Leave Balance</DialogTitle>
          <DialogDescription>
            Adjust leave balance for an employee. This will modify their current
            leave allocation.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Employee Selection */}
            <FormField
              control={form.control}
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={handleEmployeeChange}
                      value={field.value}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select an employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {employeesQuery.isLoading ? (
                          <SelectItem value="loading" disabled>
                            Loading employees...
                          </SelectItem>
                        ) : employees.length === 0 ? (
                          <SelectItem value="empty" disabled>
                            No employees found
                          </SelectItem>
                        ) : (
                          employees.map((employee) => (
                            <SelectItem key={employee.id} value={employee.id}>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {employee.user?.name ?? "Invited Employee"}
                                </span>
                                <span className="text-muted-foreground text-sm">
                                  (
                                  {employee.user?.email ?? employee.designation}
                                  )
                                </span>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Leave Type Selection */}
            <FormField
              control={form.control}
              name="leaveType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Leave Type</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select leave type" />
                      </SelectTrigger>
                      <SelectContent>
                        {LEAVE_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <span>{type.icon}</span>
                            <span>{type.label}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Current Balance Display */}
            {selectedEmployee && currentBalance && (
              <div className="bg-muted space-y-2 rounded-lg p-3">
                <Label className="text-sm font-medium">Current Balance</Label>
                <div className="text-sm">
                  <span className="font-medium">
                    {currentBalance.remaining}
                  </span>{" "}
                  days remaining out of{" "}
                  <span className="font-medium">
                    {currentBalance.totalAllowed}
                  </span>{" "}
                  allocated
                </div>
                <div className="text-muted-foreground text-xs">
                  Used: {currentBalance.totalAllowed - currentBalance.remaining}{" "}
                  days
                </div>
              </div>
            )}

            {/* Adjustment Input */}
            <FormField
              control={form.control}
              name="adjustment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adjustment (days)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter adjustment amount (positive or negative)"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                  <div className="text-muted-foreground text-xs">
                    Positive values increase balance, negative values decrease
                    it
                  </div>
                </FormItem>
              )}
            />

            {/* Reason */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide a reason for the adjustment..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDialogOpenChange(false)}
                disabled={adjustBalanceMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={adjustBalanceMutation.isPending}>
                {adjustBalanceMutation.isPending
                  ? "Adjusting..."
                  : "Adjust Balance"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
