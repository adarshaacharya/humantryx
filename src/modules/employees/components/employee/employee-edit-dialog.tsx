"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Edit } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import {
  updateEmployeeSchema,
  type UpdateEmployeeSchemaType,
} from "../../schemas/employee.schema";
import type { EmployeeWithUser } from "@/server/api/types/employee.types";

interface EmployeeEditDialogProps {
  employee: EmployeeWithUser | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onEmployeeUpdated?: () => void;
}

export function EmployeeEditDialog({
  employee,
  isOpen,
  onOpenChange,
  onEmployeeUpdated,
}: EmployeeEditDialogProps) {
  const utils = api.useUtils();

  const updateEmployee = api.employee.update.useMutation({
    onSuccess: () => {
      toast.success("Employee updated successfully!");
      void utils.employee.list.invalidate();
      void utils.employee.getById.invalidate({ id: employee?.id ?? "" });
      onEmployeeUpdated?.();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to update employee");
    },
  });

  const form = useForm<UpdateEmployeeSchemaType>({
    resolver: zodResolver(updateEmployeeSchema),
    defaultValues: {
      id: "",
      name: "",
      designation: "data_scientist",
      department: "engineering",
    },
  });

  useEffect(() => {
    if (employee) {
      form.reset({
        id: employee.id,
        name: employee.user?.name,
        designation: employee.designation,
        department: employee.department,
      });
    }
  }, [employee, form]);

  const handleSubmit = async (values: UpdateEmployeeSchemaType) => {
    updateEmployee.mutate(values);
  };

  if (!employee) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Employee
          </DialogTitle>
          <DialogDescription>Update employee information</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="w-full space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter employee's full name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="designation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Designation</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter employee's job title"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={updateEmployee.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateEmployee.isPending}>
                {updateEmployee.isPending ? "Updating..." : "Update Employee"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
