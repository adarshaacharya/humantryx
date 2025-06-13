"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowUpDown,
  MoreHorizontal,
  Eye,
  Check,
  X,
  Calendar,
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
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import { format } from "date-fns";
import type { LeaveRequest } from "../../types";

interface LeaveRequestTableMeta {
  onViewRequest: (request: LeaveRequest) => void;
  onApproveRequest: (request: LeaveRequest) => void;
  onRejectRequest: (request: LeaveRequest) => void;
  isLoading?: boolean;
  pendingActionId?: string;
  userRole?: "hr" | "employee";
}

const getLeaveStatusBadge = (status: string) => {
  switch (status) {
    case "pending":
      return <Badge variant="secondary">Pending</Badge>;
    case "approved":
      return <Badge variant="default">Approved</Badge>;
    case "rejected":
      return <Badge variant="destructive">Rejected</Badge>;
    case "cancelled":
      return <Badge variant="outline">Cancelled</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

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

export const leaveRequestColumns: ColumnDef<LeaveRequest>[] = [
  {
    accessorKey: "employee",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Employee" />
    ),
    cell: ({ row }) => {
      const request = row.original;
      return (
        <div className="flex flex-col">
          <span className="font-medium">
            {request.employee?.user?.name || "N/A"}
          </span>
          <span className="text-muted-foreground text-sm">
            {request.employee?.designation || "N/A"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "leaveType",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
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
    accessorKey: "startDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Start Date" />
    ),
    cell: ({ row }) => {
      const startDate = row.getValue("startDate") as string;
      return format(new Date(startDate), "MMM dd, yyyy");
    },
  },
  {
    accessorKey: "endDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="End Date" />
    ),
    cell: ({ row }) => {
      const endDate = row.getValue("endDate") as string;
      return format(new Date(endDate), "MMM dd, yyyy");
    },
  },
  {
    accessorKey: "totalDays",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Days" />
    ),
    cell: ({ row }) => {
      const totalDays = row.getValue("totalDays") as number;
      return (
        <div className="flex items-center">
          <Calendar className="mr-1 h-3 w-3" />
          <span>{totalDays}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return getLeaveStatusBadge(status);
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Applied" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
      return format(new Date(date), "MMM dd, yyyy");
    },
  },
  {
    id: "actions",
    cell: function ActionsCell({ row, table }) {
      const request = row.original;
      const meta = table.options.meta as LeaveRequestTableMeta;

      const isLoading = meta.isLoading && meta.pendingActionId === request.id;
      const canApproveReject =
        meta.userRole === "hr" && request.status === "pending";

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
                    onClick={() => meta.onViewRequest(request)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    <span>View Details</span>
                  </DropdownMenuItem>
                </TooltipTrigger>
                <TooltipContent>View leave request details</TooltipContent>
              </Tooltip>

              {canApproveReject && (
                <>
                  <DropdownMenuSeparator />

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuItem
                        className="flex items-center text-green-600"
                        onClick={() => meta.onApproveRequest(request)}
                        disabled={isLoading}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        <span>Approve</span>
                      </DropdownMenuItem>
                    </TooltipTrigger>
                    <TooltipContent>Approve leave request</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuItem
                        className="flex items-center text-red-600"
                        onClick={() => meta.onRejectRequest(request)}
                        disabled={isLoading}
                      >
                        <X className="mr-2 h-4 w-4" />
                        <span>Reject</span>
                      </DropdownMenuItem>
                    </TooltipTrigger>
                    <TooltipContent>Reject leave request</TooltipContent>
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
