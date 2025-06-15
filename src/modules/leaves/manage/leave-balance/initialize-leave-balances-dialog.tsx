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
import { AlertTriangle, Users, CheckCircle } from "lucide-react";

const initializeBalancesSchema = z.object({
  year: z.number().min(2020).max(2030, "Year must be between 2020 and 2030"),
});

type InitializeBalancesForm = z.infer<typeof initializeBalancesSchema>;

interface InitializeLeaveBalancesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function InitializeLeaveBalancesDialog({
  open,
  onOpenChange,
  onSuccess,
}: InitializeLeaveBalancesDialogProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  const { data: session } = authClient.useSession();
  const organizationId = session?.session?.activeOrganizationId;

  const form = useForm<InitializeBalancesForm>({
    resolver: zodResolver(initializeBalancesSchema),
    defaultValues: {
      year: new Date().getFullYear(),
    },
  });

  const initializeAllMutation =
    api.leave.initializeAllEmployeesBalances.useMutation({
      onSuccess: (result) => {
        toast.success(
          `Initialized ${result.balancesInitialized} leave balances for ${result.employeesProcessed} employees`,
        );
        onOpenChange(false);
        form.reset();
        setIsConfirming(false);
        onSuccess?.();
      },
      onError: (error) => {
        toast.error(error.message);
        setIsConfirming(false);
      },
    });

  const onSubmit = (data: InitializeBalancesForm) => {
    if (!organizationId) {
      toast.error("No organization selected");
      return;
    }

    if (!isConfirming) {
      setIsConfirming(true);
      return;
    }

    initializeAllMutation.mutate({
      organizationId,
      year: data.year,
    });
  };

  const handleDialogOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
      setIsConfirming(false);
    }
    onOpenChange(newOpen);
  };

  const handleCancel = () => {
    if (isConfirming) {
      setIsConfirming(false);
    } else {
      handleDialogOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isConfirming ? (
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            ) : (
              <Users className="h-5 w-5" />
            )}
            {isConfirming
              ? "Confirm Initialization"
              : "Initialize Leave Balances"}
          </DialogTitle>
          <DialogDescription>
            {isConfirming
              ? "This will create leave balance records for all active employees based on your leave policies. This action cannot be undone."
              : "Initialize leave balances for all employees in your organization. This will create balance records based on your current leave policies."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {!isConfirming ? (
              <>
                {/* Year Input */}
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter year"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              parseInt(e.target.value) ||
                                new Date().getFullYear(),
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 text-blue-600" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-900">
                        What this will do:
                      </p>
                      <ul className="mt-1 space-y-1 text-blue-700">
                        <li>
                          • Create leave balance records for all active
                          employees
                        </li>
                        <li>
                          • Use default allowances from your leave policies
                        </li>
                        <li>
                          • Skip employees who already have balances for this
                          year
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 text-orange-600" />
                  <div className="text-sm">
                    <p className="font-medium text-orange-900">
                      Are you sure you want to initialize leave balances for
                      year {form.getValues("year")}?
                    </p>
                    <p className="mt-2 text-orange-700">
                      This will create balance records for all active employees
                      based on your current leave policies.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={initializeAllMutation.isPending}
              >
                {isConfirming ? "Back" : "Cancel"}
              </Button>
              <Button
                type="submit"
                disabled={initializeAllMutation.isPending}
                variant={isConfirming ? "destructive" : "default"}
              >
                {initializeAllMutation.isPending
                  ? "Initializing..."
                  : isConfirming
                    ? "Yes, Initialize"
                    : "Continue"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
