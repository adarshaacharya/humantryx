"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Briefcase, Calendar, Edit } from "lucide-react";
import { format } from "date-fns";

import {
  getEmployeeStatusBadge,
  getEmployeeStatusIcon,
} from "../../constants/employee.constants";
import type { EmployeeWithUser } from "@/server/api/types/employee.types";
import { Can } from "@/components/can";

interface EmployeeDetailsDialogProps {
  employee: EmployeeWithUser | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onEditEmployee?: (employee: EmployeeWithUser) => void;
}

export function EmployeeDetailsDialog({
  employee,
  isOpen,
  onOpenChange,
  onEditEmployee,
}: EmployeeDetailsDialogProps) {
  if (!employee) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Employee Details
          </DialogTitle>
          <DialogDescription>
            View detailed information about this employee
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header with name and status */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{employee.user?.name}</h3>
              <p className="text-muted-foreground">{employee.designation}</p>
            </div>
            <div className="flex items-center gap-2">
              {employee.status && getEmployeeStatusIcon(employee.status)}
              {employee.status && getEmployeeStatusBadge(employee.status)}
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-medium">
              <Mail className="h-4 w-4" />
              Contact Information
            </h4>
            <div className="space-y-2 pl-6">
              {employee.user?.email ? (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">Email:</span>
                  <span className="text-sm">{employee.user.email}</span>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  No email available
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Job Information */}
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-medium">
              <Briefcase className="h-4 w-4" />
              Job Information
            </h4>
            <div className="space-y-2 pl-6">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">
                  Designation:
                </span>
                <span className="text-sm">{employee.designation}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">
                  Employee ID:
                </span>
                <span className="font-mono text-sm">{employee.id}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* System Information */}
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4" />
              System Information
            </h4>
            <div className="space-y-2 pl-6">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">Created:</span>
                <span className="text-sm">
                  {format(new Date(employee.createdAt), "PPP 'at' p")}
                </span>
              </div>
              {employee.updatedAt && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">
                    Last Updated:
                  </span>
                  <span className="text-sm">
                    {format(new Date(employee.updatedAt), "PPP 'at' p")}
                  </span>
                </div>
              )}
              {employee.invitationId && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">
                    Invitation ID:
                  </span>
                  <span className="font-mono text-sm">
                    {employee.invitationId}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Can an="Employee" I="manage">
              {onEditEmployee && (
                <Button
                  onClick={() => {
                    onEditEmployee(employee);
                    onOpenChange(false);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Employee
                </Button>
              )}
            </Can>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
