"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import { Progress } from "@/components/ui/progress";
import type { LeaveBalance } from "../../types";

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
    <Badge variant={typeColors[type] ?? "secondary"} className="capitalize">
      {type}
    </Badge>
  );
};

export const leaveBalanceColumns: ColumnDef<LeaveBalance>[] = [
  {
    accessorKey: "leaveType",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Leave Type" />
    ),
    cell: ({ row }) => {
      const leaveType = row.getValue("leaveType") as string;
      return getLeaveTypeBadge(leaveType);
    },
  },
  {
    accessorKey: "totalAllowed",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Allocated" />
    ),
    cell: ({ row }) => {
      const allocated = row.getValue("totalAllowed") as number;
      return (
        <div className="flex items-center">
          <span>{allocated} days</span>
        </div>
      );
    },
  },
  {
    accessorKey: "used",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Used" />
    ),
    cell: ({ row }) => {
      const totalAllowed = row.getValue("totalAllowed") as number;
      const remaining = row.getValue("remaining") as number;
      const used = totalAllowed - remaining;
      return (
        <div className="flex items-center">
          <span>{used} days</span>
        </div>
      );
    },
  },
  {
    accessorKey: "remaining",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Remaining" />
    ),
    cell: ({ row }) => {
      const remaining = row.getValue("remaining") as number;
      const totalAllowed = row.getValue("totalAllowed") as number;
      const usagePercentage =
        totalAllowed > 0
          ? ((totalAllowed - remaining) / totalAllowed) * 100
          : 0;

      return (
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{remaining} days</span>
            <span className="text-muted-foreground text-xs">
              {usagePercentage.toFixed(0)}% used
            </span>
          </div>
          <Progress value={usagePercentage} className="h-2" />
        </div>
      );
    },
  },
  {
    accessorKey: "year",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Year" />
    ),
    cell: ({ row }) => {
      const year = row.getValue("year") as number;
      return <span>{year}</span>;
    },
  },
];
