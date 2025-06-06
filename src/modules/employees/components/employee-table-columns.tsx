"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowUpDown,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  UserX,
  RefreshCw,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";
import type { EmployeeWithUser } from "../types/employee.types";
import type { InvitationStatus } from "better-auth/plugins";
import { getInvitationStatusBadge } from "../constants";

interface EmployeeTableMeta {
  onViewEmployee: (employee: EmployeeWithUser) => void;
  onEditEmployee: (employee: EmployeeWithUser) => void;
  onDeleteEmployee: (employee: EmployeeWithUser) => void;
  oncancelInvitation: (employee: EmployeeWithUser) => void;
  onResendInvitation: (employee: EmployeeWithUser) => void;
  isLoading?: boolean;
  pendingActionId?: string;
}

export const employeeColumns: ColumnDef<EmployeeWithUser>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      const employee = row.original;

      return (
        <div className="flex flex-col">
          <span className="font-medium">{name}</span>
          {employee.user?.email && (
            <span className="text-muted-foreground text-sm">
              {employee.user.email}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "designation",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Designation
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "invitationStatus",
    header: "Invitation Status",
    cell: ({ row }) => {
      const status = row.getValue(
        "invitationStatus",
      ) as InvitationStatus | null;
      return getInvitationStatusBadge(status);
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Joined
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
      return format(new Date(date), "MMM dd, yyyy");
    },
  },
  {
    id: "actions",
    cell: function ActionsCell({ row, table }) {
      const employee = row.original;
      const meta = table.options.meta as EmployeeTableMeta;

      const isLoading = meta.isLoading && meta.pendingActionId === employee.id;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0"
              disabled={isLoading}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuItem
                    className="flex items-center"
                    onClick={() => meta.onViewEmployee(employee)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    <span>View Details</span>
                  </DropdownMenuItem>
                </TooltipTrigger>
                <TooltipContent>View employee profile</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuItem
                    className="flex items-center"
                    onClick={() => meta.onEditEmployee(employee)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                </TooltipTrigger>
                <TooltipContent>Edit employee details</TooltipContent>
              </Tooltip>

              <DropdownMenuSeparator />

              {employee.invitationStatus === "pending" && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuItem
                        className="flex items-center"
                        onClick={() => meta.onResendInvitation(employee)}
                        disabled={isLoading}
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        <span>Resend Invitation</span>
                      </DropdownMenuItem>
                    </TooltipTrigger>
                    <TooltipContent>Resend invitation email</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuItem
                        className="text-destructive flex items-center"
                        onClick={() => meta.oncancelInvitation(employee)}
                        disabled={isLoading}
                      >
                        <UserX className="mr-2 h-4 w-4" />
                        <span>Cancel Invitation</span>
                      </DropdownMenuItem>
                    </TooltipTrigger>
                    <TooltipContent>Cancel this invitation</TooltipContent>
                  </Tooltip>

                  <DropdownMenuSeparator />
                </>
              )}

              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuItem
                    className="text-destructive flex items-center"
                    onClick={() => meta.onDeleteEmployee(employee)}
                    disabled={isLoading}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>{isLoading ? "Deleting..." : "Delete"}</span>
                  </DropdownMenuItem>
                </TooltipTrigger>
                <TooltipContent>Remove employee</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
