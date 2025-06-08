"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Trash2, MoreHorizontal, Eye } from "lucide-react";
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

export type FilterStatus = "pending" | "accepted" | "expired" | "all";
export type InvitationStatus = Exclude<FilterStatus, "all">;
export type SortDirection = "asc" | "desc";
export type SortBy = "createdAt" | "email" | "status";

export interface InvitationQueryParams {
  limit: number;
  offset: number;
  searchQuery: string;
  sortBy: SortBy;
  sortDirection: SortDirection;
  status: FilterStatus;
}

export type Invitation = {
  id: string;
  email: string;
  status: string;
  role: string | null;
  expiresAt: Date;
  organizationId: string;
  organizationName: string | null;
  inviterId: string;
  inviterName: string | null;
  inviterEmail: string | null;
  employeeDesignation?: string;
};

export const columns: ColumnDef<Invitation>[] = [
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "organizationName",
    header: "Organization",
    cell: ({ row }) => {
      const organizationId = row.original.organizationId;
      const organizationName = row.getValue("organizationName") as string;

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="hover:text-primary cursor-pointer underline underline-offset-4">
                {organizationName}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Organization ID: {organizationId}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Role",
  },

  {
    accessorKey: "employeeDesignation",
    header: "Employee Designation",
  },

  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const getStatusColor = (status: string) => {
        switch (status) {
          case "pending":
            return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
          case "accepted":
            return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
          case "expired":
            return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
          default:
            return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
        }
      };

      return <Badge className={getStatusColor(status)}>{status}</Badge>;
    },
  },
  {
    accessorKey: "inviterName",
    header: "Invited By",
    cell: ({ row }) => {
      const inviterEmail = row.original.inviterEmail;
      const inviterName = row.getValue("inviterName") as string;

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="hover:text-primary cursor-pointer underline underline-offset-4">
                {inviterName}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{inviterEmail}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: "expiresAt",
    header: "Expires At",
    cell: ({ row }) => {
      const expiresAt = row.getValue("expiresAt") as Date;
      return expiresAt ? format(new Date(expiresAt), "MMM dd, yyyy") : "N/A";
    },
  },
  {
    id: "actions",
    cell: function ActionsCell({ row, table }) {
      const invitation = row.original;
      const meta = table.options.meta as {
        openCancelDialog: (invitation: Invitation) => void;
        isCancelling?: boolean;
        pendingCancelId?: string;
      };

      const isLoading =
        meta.isCancelling && meta.pendingCancelId === invitation.id;

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
                  <DropdownMenuItem className="flex items-center">
                    <Eye className="mr-2 h-4 w-4" />
                    <span>View Details</span>
                  </DropdownMenuItem>
                </TooltipTrigger>
                <TooltipContent>View invitation details</TooltipContent>
              </Tooltip>

              <DropdownMenuSeparator />

              {invitation.status === "pending" && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuItem
                      className="flex items-center"
                      disabled={isLoading}
                      onClick={() => meta.openCancelDialog(invitation)}
                    >
                      <Trash2 className="text-destructive mr-2 h-4 w-4" />
                      <span className="text-destructive">
                        {isLoading ? "Cancelling..." : "Cancel Invitation"}
                      </span>
                    </DropdownMenuItem>
                  </TooltipTrigger>
                  <TooltipContent>Cancel this invitation</TooltipContent>
                </Tooltip>
              )}
            </TooltipProvider>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
