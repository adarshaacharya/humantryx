"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2, Check, X } from "lucide-react";
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
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import type { LeavePolicy } from "../../types";

interface LeavePolicyTableMeta {
  onEditPolicy: (policy: LeavePolicy) => void;
  onDeletePolicy: (policy: LeavePolicy) => void;
  isLoading?: boolean;
  pendingActionId?: string;
  userRole?: "hr" | "employee";
}

const getLeaveTypeBadge = (type: string) => {
  const typeColors: Record<
    string,
    "default" | "secondary" | "destructive" | "outline"
  > = {
    annual: "default",
    sick: "destructive",
    casual: "secondary",
    maternity: "outline",
    paternity: "outline",
    emergency: "destructive",
  };

  return (
    <Badge variant={typeColors[type] || "secondary"} className="capitalize">
      {type}
    </Badge>
  );
};

export const leavePolicyColumns: ColumnDef<LeavePolicy>[] = [
  {
    accessorKey: "leaveType",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Leave Type" />
    ),
    cell: ({ row }) => {
      const leaveType = row.getValue("leaveType") as string;
      return getLeaveTypeBadge(leaveType);
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "defaultAllowance",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Default Allowance" />
    ),
    cell: ({ row }) => {
      const allowance = row.getValue("defaultAllowance") as number;
      return <span>{allowance} days</span>;
    },
  },
  {
    accessorKey: "carryForward",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Carry Forward" />
    ),
    cell: ({ row }) => {
      const carryForward = row.getValue("carryForward") as boolean;
      return (
        <div className="flex items-center">
          {carryForward ? (
            <div className="flex items-center text-green-600">
              <Check className="mr-1 h-4 w-4" />
              <span>Yes</span>
            </div>
          ) : (
            <div className="flex items-center text-red-600">
              <X className="mr-1 h-4 w-4" />
              <span>No</span>
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "maxCarryForward",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Max Carry Forward" />
    ),
    cell: ({ row }) => {
      const maxCarryForward = row.getValue("maxCarryForward") as number;
      const carryForward = row.getValue("carryForward") as boolean;

      if (!carryForward) {
        return <span className="text-muted-foreground">-</span>;
      }

      return <span>{maxCarryForward} days</span>;
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
      return new Date(date).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
  },
  {
    id: "actions",
    cell: function ActionsCell({ row, table }) {
      const policy = row.original;
      const meta = table.options.meta as LeavePolicyTableMeta;

      const isLoading = meta.isLoading && meta.pendingActionId === policy.id;
      const canEdit = meta.userRole === "hr";

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0"
              disabled={isLoading || !canEdit}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            <TooltipProvider>
              {canEdit && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuItem
                        className="flex items-center"
                        onClick={() => meta.onEditPolicy(policy)}
                        disabled={isLoading}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Edit Policy</span>
                      </DropdownMenuItem>
                    </TooltipTrigger>
                    <TooltipContent>Edit leave policy</TooltipContent>
                  </Tooltip>

                  <DropdownMenuSeparator />

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuItem
                        className="flex items-center text-red-600"
                        onClick={() => meta.onDeletePolicy(policy)}
                        disabled={isLoading}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete Policy</span>
                      </DropdownMenuItem>
                    </TooltipTrigger>
                    <TooltipContent>Delete leave policy</TooltipContent>
                  </Tooltip>
                </>
              )}
            </TooltipProvider>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
