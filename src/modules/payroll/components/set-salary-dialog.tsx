"use client";

import { useState } from "react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  setSalarySettingsSchema,
  type SetSalarySettingsForm,
} from "../schemas";

interface SetSalaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function SetSalaryDialog({
  open,
  onOpenChange,
  onSuccess,
}: SetSalaryDialogProps) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<
    string | undefined
  >("");

  const form = useForm<SetSalarySettingsForm>({
    resolver: zodResolver(setSalarySettingsSchema),
    defaultValues: {
      employeeId: "",
      baseSalary: 0,
      taxPercentage: 0,
    },
  });

  // Fetch employees for selection
  const employeesQuery = api.payroll.getEmployeesWithSalarySettings.useQuery(
    undefined,
    { enabled: open },
  );

  // Get existing salary settings when employee is selected
  const salarySettingsQuery = api.payroll.getSalarySettings.useQuery(
    { employeeId: selectedEmployeeId },
    { enabled: !!selectedEmployeeId },
  );

  const setSalaryMutation = api.payroll.setSalarySettings.useMutation({
    onSuccess: () => {
      toast.success("Salary settings updated successfully");
      onSuccess?.();
      onOpenChange(false);
      form.reset();
      setSelectedEmployeeId("");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const employees = employeesQuery.data ?? [];

  const handleEmployeeChange = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    form.setValue("employeeId", employeeId);
  };

  // Populate form when salary settings are loaded
  React.useEffect(() => {
    if (salarySettingsQuery.data) {
      const settings = salarySettingsQuery.data;
      form.setValue("baseSalary", parseFloat(settings.baseSalary));
      form.setValue("taxPercentage", parseFloat(settings.taxPercentage ?? "0"));
    }
  }, [salarySettingsQuery.data, form]);

  const onSubmit = (data: SetSalarySettingsForm) => {
    setSalaryMutation.mutate(data);
  };

  const handleCancel = () => {
    form.reset();
    setSelectedEmployeeId("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Set Employee Salary</DialogTitle>
          <DialogDescription>
            Configure salary settings for an employee including base salary and
            tax percentage.
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
                                {employee.salarySettings && (
                                  <span className="rounded bg-green-100 px-1 text-xs text-green-700">
                                    Has Salary
                                  </span>
                                )}
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

            {/* Base Salary */}
            <FormField
              control={form.control}
              name="baseSalary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Base Salary (USD)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g., 5000"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tax Percentage */}
            <FormField
              control={form.control}
              name="taxPercentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax Percentage (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g., 20"
                      step="0.1"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Existing salary info */}
            {salarySettingsQuery.data && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                <div className="mb-1 text-sm font-medium text-blue-800">
                  Current Settings
                </div>
                <div className="text-sm text-blue-700">
                  Base Salary: $
                  {parseFloat(
                    salarySettingsQuery.data.baseSalary,
                  ).toLocaleString()}
                </div>
                <div className="text-sm text-blue-700">
                  Tax Rate:{" "}
                  {parseFloat(salarySettingsQuery.data.taxPercentage ?? "0")}%
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={setSalaryMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={setSalaryMutation.isPending || !selectedEmployeeId}
              >
                {setSalaryMutation.isPending ? "Saving..." : "Save Settings"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
