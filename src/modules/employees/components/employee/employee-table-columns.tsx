"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
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
import { getEmployeeStatusBadge } from "../../constants/employee.constants";
import { IdCell } from "@/components/id-cell";
import type { EmployeeWithUser } from "@/server/api/types/employee.types";
import { Can } from "@/components/can";
import { startCase } from "lodash-es";

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
    accessorKey: "id",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <IdCell id={row.getValue("id")} />;
    },
  },
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
      const employee = row.original;

      return (
        <div className="flex flex-col">
          <span className="font-medium">{employee.user?.name}</span>
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
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const email = row.original.user?.email ?? "N/A";
      return <span className="text-sm">{email}</span>;
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
    cell: ({ row }) => {
      const designation = row.original.designation;
      return (
        <span className="text-center text-sm">{startCase(designation)}</span>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const status = row.original.status;
      return <span className="text-sm">{getEmployeeStatusBadge(status)}</span>;
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

              <Can I="manage" an="Employee">
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
              </Can>
            </TooltipProvider>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
