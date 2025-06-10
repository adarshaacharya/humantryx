"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createLeaveRequestSchema, type CreateLeaveRequest } from "../schemas";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, FileText } from "lucide-react";
import { LEAVE_TYPES } from "../constants";
import { useState, useEffect } from "react";

type LeaveRequestFormProps = {
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function LeaveRequestForm({
  onSuccess,
  onCancel,
}: LeaveRequestFormProps) {
  const [totalDays, setTotalDays] = useState(0);

  const form = useForm<CreateLeaveRequest>({
    resolver: zodResolver(createLeaveRequestSchema),
    defaultValues: {
      leaveType: "casual",
      startDate: "",
      endDate: "",
      reason: "",
    },
  });

  const createMutation = api.leave.create.useMutation({
    onSuccess: () => {
      toast.success("Leave request submitted successfully");
      form.reset();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const balancesQuery = api.leave.getBalances.useQuery({});

  // Calculate total days when dates change
  const startDate = form.watch("startDate");
  const endDate = form.watch("endDate");

  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (end >= start) {
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setTotalDays(diffDays);
      } else {
        setTotalDays(0);
      }
    } else {
      setTotalDays(0);
    }
  }, [startDate, endDate]);

  const onSubmit = (data: CreateLeaveRequest) => {
    createMutation.mutate(data);
  };

  const selectedLeaveType = form.watch("leaveType");
  const currentBalance = balancesQuery.data?.find(
    (b) => b.leaveType === selectedLeaveType,
  );

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Request Leave
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="leaveType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Leave Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select leave type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {LEAVE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}
                        
                        >
                          <div className="flex items-center gap-2">
                            <span>{type.icon}</span>
                            <span>{type.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {currentBalance && (
                    <div className="text-muted-foreground text-sm">
                      Available: {currentBalance.remaining} days
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date Selection */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Start Date
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      End Date
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Total Days Display */}
            {totalDays > 0 && (
              <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  Total Days: {totalDays}
                </span>
                {currentBalance && totalDays > currentBalance.remaining && (
                  <span className="ml-auto text-sm text-red-600">
                    Insufficient balance!
                  </span>
                )}
              </div>
            )}

            {/* Reason */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please provide a reason for your leave request..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end gap-3">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                disabled={
                  createMutation.isPending ||
                  (currentBalance && totalDays > currentBalance.remaining)
                }
              >
                {createMutation.isPending ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
