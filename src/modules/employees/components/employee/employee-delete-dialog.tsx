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
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import type { EmployeeWithUser } from "@/server/api/types/employee.types";

interface EmployeeDeleteDialogProps {
  employee: EmployeeWithUser | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onEmployeeDeleted?: () => void;
}

export function EmployeeDeleteDialog({
  employee,
  isOpen,
  onOpenChange,
  onEmployeeDeleted,
}: EmployeeDeleteDialogProps) {
  const utils = api.useUtils();

  const deleteEmployee = api.employee.delete.useMutation({
    onSuccess: () => {
      toast.success("Employee deleted successfully!");
      void utils.employee.list.invalidate();
      onEmployeeDeleted?.();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to delete employee");
    },
  });

  const handleDelete = () => {
    if (!employee) return;

    deleteEmployee.mutate({
      id: employee.id,
      organizationId: employee.organizationId,
    });
  };

  if (!employee) {
    return null;
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="text-destructive h-5 w-5" />
            Delete Employee
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                Are you sure you want to delete this employee? This action
                cannot be undone.
              </p>

              <div className="bg-muted/50 rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{employee.user?.name}</p>
                    <p className="text-muted-foreground text-sm">
                      {employee.designation}
                    </p>
                    {employee.user?.email && (
                      <p className="text-muted-foreground text-sm">
                        {employee.user.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {employee.status === "active" && (
                <p className="text-sm font-medium text-amber-600">
                  ⚠️ Warning: This employee is currently active in the system.
                </p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteEmployee.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant="destructive"
              disabled={deleteEmployee.isPending}
              onClick={handleDelete}
            >
              {deleteEmployee.isPending
                ? "Deleting..."
                : "Yes, delete employee"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
