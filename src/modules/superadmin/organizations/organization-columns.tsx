"use client";

import { type ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Play,
  Ban,
  ExternalLink,
  Settings,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";

export type Organization = {
  id: string;
  name: string;
  slug: string | null;
  createdAt: Date;
  membersCount: number;
  status: "active" | "suspended";
};

export const organizationColumns: ColumnDef<Organization>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Organization" />
    ),
    cell: ({ row }) => {
      const organization = row.original;
      return (
        <div>
          <div className="font-medium">{organization.name}</div>
          {organization.slug && (
            <div className="text-muted-foreground text-sm">
              {organization.slug}
            </div>
          )}
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
      const status = row.getValue("status") as "active" | "suspended";
      return (
        <Badge variant={status === "active" ? "default" : "destructive"}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
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
    accessorKey: "membersCount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Members" />
    ),
  },
  {
    id: "actions",
    cell: function ActionsCell({ row, table }) {
      const organization = row.original;
      const meta = table.options.meta as {
        updateStatus: (id: string, status: "active" | "suspended") => void;
        isUpdating?: boolean;
        pendingStatusChangeId?: string;
      };

      const isLoading =
        meta.isUpdating && meta.pendingStatusChangeId === organization.id;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              disabled={isLoading}
              aria-label="Open menu"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuItem className="flex items-center">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  <span>View Details</span>
                </DropdownMenuItem>
              </TooltipTrigger>
              <TooltipContent>View organization details</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuItem className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
              </TooltipTrigger>
              <TooltipContent>Manage organization settings</TooltipContent>
            </Tooltip>

            <DropdownMenuSeparator />

            {organization.status === "suspended" ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuItem
                    className="flex items-center"
                    disabled={isLoading}
                    onClick={() => meta.updateStatus(organization.id, "active")}
                  >
                    <Play className="mr-2 h-4 w-4 text-green-600" />
                    <span className="text-green-600">
                      {isLoading ? "Activating..." : "Activate Organization"}
                    </span>
                  </DropdownMenuItem>
                </TooltipTrigger>
                <TooltipContent>Allow organization access</TooltipContent>
              </Tooltip>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuItem
                    className="flex items-center"
                    disabled={isLoading}
                    onClick={() =>
                      meta.updateStatus(organization.id, "suspended")
                    }
                  >
                    <Ban className="text-destructive mr-2 h-4 w-4" />
                    <span className="text-destructive">
                      {isLoading ? "Suspending..." : "Suspend Organization"}
                    </span>
                  </DropdownMenuItem>
                </TooltipTrigger>
                <TooltipContent>Prevent organization access</TooltipContent>
              </Tooltip>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
