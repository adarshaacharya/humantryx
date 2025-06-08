"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowUpDown,
  MoreHorizontal,
  Eye,
  RefreshCw,
  UserX,
  Calendar,
  Mail,
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
import type { InvitationWithDetails } from "../../types/invitation.types";
import { getInvitationStatusBadge } from "../../constants/invitation.constants";
import type { InvitationStatus } from "better-auth/plugins";
import type { InvitationRole } from "@/server/db/consts";

interface InvitationTableMeta {
  onViewInvitation: (invitation: InvitationWithDetails) => void;
  onResendInvitation: (invitation: InvitationWithDetails) => void;
  onCancelInvitation: (invitation: InvitationWithDetails) => void;
  isLoading?: boolean;
  pendingActionId?: string;
}

export const invitationColumns: ColumnDef<InvitationWithDetails>[] = [
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
      const email = row.getValue("email") as string;
      const invitation = row.original;

      return (
        <div className="flex flex-col">
          <span className="font-medium">{email}</span>
          {invitation.employeeName && (
            <span className="text-muted-foreground text-sm">
              {invitation.employeeName}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Org Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as InvitationRole;
      return (
        <Badge variant="outline" className="capitalize">
          {role ?? "Member"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "employeeDesignation",
    header: "Employee Designation",
    cell: ({ row }) => {
      const designation = row.getValue("employeeDesignation") as string | null;
      return designation ?? "N/A";
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
      const status = row.getValue("status") as InvitationStatus | null;
      return getInvitationStatusBadge(status);
    },
  },
  {
    accessorKey: "expiresAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Expires
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const expiresAt = row.getValue("expiresAt") as Date;
      const now = new Date();
      const isExpired = expiresAt < now;

      return (
        <div className="flex flex-col">
          <span className={isExpired ? "text-red-600" : ""}>
            {format(expiresAt, "MMM dd, yyyy")}
          </span>
          <span className="text-muted-foreground text-xs">
            {format(expiresAt, "h:mm a")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "inviterName",
    header: "Invited By",
    cell: ({ row }) => {
      const inviterName = row.getValue("inviterName") as string | null;
      const invitation = row.original;

      return (
        <div className="flex flex-col">
          <span className="font-medium">{inviterName ?? "Unknown"}</span>
          {invitation.inviterEmail && (
            <span className="text-muted-foreground text-sm">
              {invitation.inviterEmail}
            </span>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: function ActionsCell({ row, table }) {
      const invitation = row.original;
      const meta = table.options.meta as InvitationTableMeta;

      const isLoading =
        meta.isLoading && meta.pendingActionId === invitation.id;
      const isPending = invitation.status === "pending";
      const isExpired = new Date(invitation.expiresAt) < new Date();

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
                    onClick={() => meta.onViewInvitation(invitation)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    <span>View Details</span>
                  </DropdownMenuItem>
                </TooltipTrigger>
                <TooltipContent>View invitation details</TooltipContent>
              </Tooltip>

              {isPending && !isExpired && (
                <>
                  <DropdownMenuSeparator />

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuItem
                        className="flex items-center"
                        onClick={() => meta.onResendInvitation(invitation)}
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
                        onClick={() => meta.onCancelInvitation(invitation)}
                        disabled={isLoading}
                      >
                        <UserX className="mr-2 h-4 w-4" />
                        <span>Cancel Invitation</span>
                      </DropdownMenuItem>
                    </TooltipTrigger>
                    <TooltipContent>Cancel this invitation</TooltipContent>
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
