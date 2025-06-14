"use client";

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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { generatePayrollSchema, type GeneratePayrollForm } from "../schemas";
import { MONTHS, CURRENT_YEAR } from "../constants";

interface GeneratePayrollDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function GeneratePayrollDialog({
  open,
  onOpenChange,
  onSuccess,
}: GeneratePayrollDialogProps) {
  const form = useForm({
    resolver: zodResolver(generatePayrollSchema),
    defaultValues: {
      employeeId: "",
      payrollMonth: "",
      bonuses: 0,
      unpaidLeaveDays: 0,
      notes: "",
    },
  });

  // Fetch employees with salary settings
  const employeesQuery = api.payroll.getEmployeesWithSalarySettings.useQuery(
    undefined,
    { enabled: open },
  );

  const generatePayrollMutation = api.payroll.generatePayroll.useMutation({
    onSuccess: () => {
      toast.success("Payroll generated successfully");
      onSuccess?.();
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const employees = employeesQuery.data ?? [];
  const employeesWithSalary = employees.filter((emp) => emp.salarySettings);

  const onSubmit = (data: GeneratePayrollForm) => {
    generatePayrollMutation.mutate(data);
  };

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  // Calculate estimated values based on form inputs
  const selectedEmployeeId = form.watch("employeeId");
  const bonuses = form.watch("bonuses") || 0;
  const unpaidLeaveDays = form.watch("unpaidLeaveDays") || 0;

  const selectedEmployee = employeesWithSalary.find(
    (emp) => emp.id === selectedEmployeeId,
  );
  const baseSalary = selectedEmployee?.salarySettings
    ? parseFloat(selectedEmployee.salarySettings.baseSalary)
    : 0;
  const taxPercentage = selectedEmployee?.salarySettings
    ? parseFloat(selectedEmployee.salarySettings.taxPercentage ?? "0")
    : 0;

  // Calculate estimates
  const perDayRate = baseSalary / 30;
  const leaveDeduction = unpaidLeaveDays * perDayRate;
  const grossPay = baseSalary + bonuses;
  const taxDeduction = (grossPay * taxPercentage) / 100;
  const estimatedNetPay = grossPay - leaveDeduction - taxDeduction;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Generate Payroll</DialogTitle>
          <DialogDescription>
            Generate payroll for an employee for a specific month with bonuses
            and deductions.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Employee Selection */}
              <FormField
                control={form.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Employee</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
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
                          ) : employeesWithSalary.length === 0 ? (
                            <SelectItem value="empty" disabled>
                              No employees with salary settings found
                            </SelectItem>
                          ) : (
                            employeesWithSalary.map((employee) => (
                              <SelectItem key={employee.id} value={employee.id}>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">
                                    {employee.user?.name ?? "Invited Employee"}
                                  </span>
                                  <span className="text-muted-foreground text-sm">
                                    ($
                                    {parseFloat(
                                      employee.salarySettings!.baseSalary,
                                    ).toLocaleString()}
                                    /month)
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

              {/* Month and Year */}
              <FormField
                control={form.control}
                name="payrollMonth"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Payroll Month</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select month and year" />
                        </SelectTrigger>
                        <SelectContent>
                          {MONTHS.map(
                            (month: { value: string; label: string }) => (
                              <SelectItem
                                key={`${CURRENT_YEAR}-${month.value}`}
                                value={`${CURRENT_YEAR}-${month.value}`}
                              >
                                {month.label} {CURRENT_YEAR}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Bonuses */}
              <FormField
                control={form.control}
                name="bonuses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bonuses (USD)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
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

              {/* Unpaid Leave Days */}
              <FormField
                control={form.control}
                name="unpaidLeaveDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unpaid Leave Days</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
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

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any additional notes for this payroll..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Payroll Calculation Preview */}
            {selectedEmployee && (
              <div className="rounded-lg border bg-slate-50 p-4">
                <div className="mb-3 text-sm font-medium text-slate-800">
                  Payroll Calculation Preview
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Base Salary:</span>
                    <span>${baseSalary.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bonuses:</span>
                    <span className="text-green-600">
                      +${bonuses.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-1">
                    <span className="font-medium">Gross Pay:</span>
                    <span className="font-medium">
                      ${grossPay.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Leave Deduction ({unpaidLeaveDays} days):</span>
                    <span>-${leaveDeduction.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Tax Deduction ({taxPercentage}%):</span>
                    <span>-${taxDeduction.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-1 font-semibold">
                    <span>Net Pay:</span>
                    <span className="text-green-600">
                      ${estimatedNetPay.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={generatePayrollMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  generatePayrollMutation.isPending || !selectedEmployeeId
                }
              >
                {generatePayrollMutation.isPending
                  ? "Generating..."
                  : "Generate Payroll"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
