"use client";

import { type ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Ban,
  UnlockIcon,
  Eye,
  ShieldAlert,
  ShieldCheck,
  Clock,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";

export type User = {
  id: string;
  name: string;
  email: string;
  role: "user" | "super_admin";
  createdAt: Date;
  banned?: boolean | null
  banReason?: string | null;
  banExpires?: Date | null;
};

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="User" />
    ),
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarFallback>
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{user.name}</div>
            <div className="text-muted-foreground text-sm">{user.email}</div>
          </div>
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
      const user = row.original;

      if (!user.banned) {
        return <Badge variant="outline">Active</Badge>;
      }

      return (
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="destructive" className="flex items-center gap-1">
              <Ban className="h-3 w-3" />
              Banned
              {user.banExpires && <Clock className="h-3 w-3" />}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{user.banReason}</p>
            {user.banExpires && (
              <p>Expires: {format(user.banExpires, "PPp")}</p>
            )}
          </TooltipContent>
        </Tooltip>
      );
    },
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ row }) => {
      const role = row.getValue("role");
      return (
        <Badge variant={role === "super_admin" ? "default" : "outline"}>
          {role === "super_admin" ? "Admin" : "User"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Joined" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
      return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
  },
  {
    id: "actions",
    cell: function ActionsCell({ row, table }) {
      const user = row.original;
      const meta = table.options.meta as {
        updateRole: (id: string, role: "super_admin" | "user") => void;
        banUser: (id: string, reason?: string) => void;
        unbanUser: (id: string) => void;
        isUpdating?: boolean;
        isBanning?: boolean;
        isUnbanning?: boolean;
        pendingActionId?: string;
      };

      const isLoading =
        (meta.isUpdating && meta.pendingActionId === user.id) ||
        (meta.isBanning && meta.pendingActionId === user.id) ||
        (meta.isUnbanning && meta.pendingActionId === user.id);

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
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuItem className="flex items-center">
                  <Eye className="mr-2 h-4 w-4" />
                  <span>View Details</span>
                </DropdownMenuItem>
              </TooltipTrigger>
              <TooltipContent>View user details</TooltipContent>
            </Tooltip>

            <DropdownMenuSeparator />

            {user.role === "user" ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuItem
                    className="flex items-center"
                    disabled={isLoading}
                    onClick={() => meta.updateRole(user.id, "super_admin")}
                  >
                    <ShieldAlert className="mr-2 h-4 w-4 text-amber-600" />
                    <span className="text-amber-600">
                      {meta.isUpdating && meta.pendingActionId === user.id
                        ? "Making Admin..."
                        : "Make Admin"}
                    </span>
                  </DropdownMenuItem>
                </TooltipTrigger>
                <TooltipContent>Grant admin privileges</TooltipContent>
              </Tooltip>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuItem
                    className="flex items-center"
                    disabled={isLoading}
                    onClick={() => meta.updateRole(user.id, "user")}
                  >
                    <ShieldCheck className="text-destructive mr-2 h-4 w-4" />
                    <span className="text-destructive">
                      {meta.isUpdating && meta.pendingActionId === user.id
                        ? "Removing Admin..."
                        : "Remove Admin"}
                    </span>
                  </DropdownMenuItem>
                </TooltipTrigger>
                <TooltipContent>Remove admin privileges</TooltipContent>
              </Tooltip>
            )}

            <DropdownMenuSeparator />

            {!user.banned ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuItem
                    className="flex items-center"
                    disabled={isLoading}
                    onClick={() => meta.banUser(user.id)}
                  >
                    <Ban className="text-destructive mr-2 h-4 w-4" />
                    <span className="text-destructive">
                      {meta.isBanning && meta.pendingActionId === user.id
                        ? "Banning..."
                        : "Ban User"}
                    </span>
                  </DropdownMenuItem>
                </TooltipTrigger>
                <TooltipContent>Ban this user</TooltipContent>
              </Tooltip>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuItem
                    className="flex items-center"
                    disabled={isLoading}
                    onClick={() => meta.unbanUser(user.id)}
                  >
                    <UnlockIcon className="mr-2 h-4 w-4 text-green-600" />
                    <span className="text-green-600">
                      {meta.isUnbanning && meta.pendingActionId === user.id
                        ? "Unbanning..."
                        : "Unban User"}
                    </span>
                  </DropdownMenuItem>
                </TooltipTrigger>
                <TooltipContent>Remove user ban</TooltipContent>
              </Tooltip>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
