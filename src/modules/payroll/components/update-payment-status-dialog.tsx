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
import { toast } from "sonner";
import {
  updatePaymentStatusSchema,
  type UpdatePaymentStatusForm,
} from "../schemas";
import { PAYMENT_STATUSES } from "../constants";
import type { PayrollRecord } from "../types";
import { format } from "date-fns";

interface UpdatePaymentStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payrollRecord: PayrollRecord | null;
  onSuccess?: () => void;
}

export function UpdatePaymentStatusDialog({
  open,
  onOpenChange,
  payrollRecord,
  onSuccess,
}: UpdatePaymentStatusDialogProps) {
  const form = useForm<UpdatePaymentStatusForm>({
    resolver: zodResolver(updatePaymentStatusSchema),
    defaultValues: {
      payrollId: "",
      status: "pending",
      paymentDate: undefined,
      paymentReference: "",
    },
  });

  const updatePaymentMutation = api.payroll.updatePaymentStatus.useMutation({
    onSuccess: () => {
      toast.success("Payment status updated successfully");
      onSuccess?.();
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Update form when payroll record changes
  React.useEffect(() => {
    if (payrollRecord && open) {
      form.setValue("payrollId", payrollRecord.id);
      form.setValue("status", payrollRecord.paymentStatus);
      if (payrollRecord.paymentDate) {
        form.setValue("paymentDate", new Date(payrollRecord.paymentDate));
      }
      if (payrollRecord.paymentReference) {
        form.setValue("paymentReference", payrollRecord.paymentReference);
      }
    }
  }, [payrollRecord, open, form]);

  const onSubmit = (data: UpdatePaymentStatusForm) => {
    updatePaymentMutation.mutate(data);
  };

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  const currentStatus = form.watch("status");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Payment Status</DialogTitle>
          <DialogDescription>
            Update the payment status and add payment details for this payroll
            record.
          </DialogDescription>
        </DialogHeader>

        {payrollRecord && (
          <div className="rounded-lg border bg-slate-50 p-3">
            <div className="mb-2 text-sm font-medium text-slate-800">
              Payroll Information
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Employee:</span>
                <span className="font-medium">
                  {payrollRecord.employee?.user?.name || "Unknown"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Month:</span>
                <span>
                  {format(
                    new Date(payrollRecord.payrollMonth + "-01"),
                    "MMMM yyyy",
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Net Pay:</span>
                <span className="font-medium text-green-600">
                  ${parseFloat(payrollRecord.netPay).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Payment Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Status</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select payment status" />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_STATUSES.map((status) => {
                          const StatusIcon = status.icon;
                          return (
                            <SelectItem key={status.value} value={status.value}>
                              <div className="flex items-center gap-2">
                                <StatusIcon className="h-4 w-4" />
                                <span>{status.label}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Payment Date - only show if status is paid */}
            {currentStatus === "paid" && (
              <FormField
                control={form.control}
                name="paymentDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        value={
                          field.value ? format(field.value, "yyyy-MM-dd") : ""
                        }
                        onChange={(e) => {
                          const date = e.target.value
                            ? new Date(e.target.value)
                            : undefined;
                          field.onChange(date);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Payment Reference - only show if status is paid */}
            {currentStatus === "paid" && (
              <FormField
                control={form.control}
                name="paymentReference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Reference (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Transaction ID, Check number..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={updatePaymentMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updatePaymentMutation.isPending}>
                {updatePaymentMutation.isPending
                  ? "Updating..."
                  : "Update Status"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
