"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Clock,
  Calendar as CalendarIcon,
  User,
  Timer,
  Coffee,
  MoreHorizontal,
  ArrowUpDown,
} from "lucide-react";
import { format } from "date-fns";
import { type AttendanceRecord } from "../../types";

const statusConfig = {
  clocked_in: {
    label: "Clocked In",
    variant: "default" as const,
    icon: Clock,
  },
  clocked_out: {
    label: "Clocked Out",
    variant: "secondary" as const,
    icon: Clock,
  },
  break_start: {
    label: "On Break",
    variant: "outline" as const,
    icon: Coffee,
  },
  break_end: {
    label: "Break End",
    variant: "outline" as const,
    icon: Coffee,
  },
};

interface AttendanceTableMeta {
  onViewRecord?: (record: AttendanceRecord) => void;
  onEditRecord?: (record: AttendanceRecord) => void;
  showEmployeeInfo?: boolean;
}

export const attendanceColumns: ColumnDef<AttendanceRecord>[] = [
  {
    accessorKey: "employee",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-8 px-2 lg:px-3"
      >
        <User className="mr-2 h-4 w-4" />
        Employee
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row, table }) => {
      const meta = table.options.meta as AttendanceTableMeta;
      const record = row.original;

      if (!meta?.showEmployeeInfo) {
        return null;
      }

      return (
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 rounded-full p-1">
            <User className="text-primary h-3 w-3" />
          </div>
          <div>
            <div className="font-medium">
              {record.employee?.user?.name ?? "Unknown"}
            </div>
            <div className="text-muted-foreground text-xs">
              {record.employee?.user?.email}
            </div>
          </div>
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "clockInTime",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-8 px-2 lg:px-3"
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const record = row.original;
      return (
        <div className="flex items-center gap-2">
          <CalendarIcon className="text-muted-foreground h-3 w-3" />
          {format(record.clockInTime, "MMM dd, yyyy")}
        </div>
      );
    },
  },
  {
    accessorKey: "clockInTime",
    id: "clockInTimeTime",
    header: () => (
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4" />
        Clock In
      </div>
    ),
    cell: ({ row }) => {
      const record = row.original;
      return (
        <div className="font-mono text-sm">
          {format(record.clockInTime, "HH:mm:ss")}
        </div>
      );
    },
  },
  {
    accessorKey: "clockOutTime",
    header: () => (
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4" />
        Clock Out
      </div>
    ),
    cell: ({ row }) => {
      const record = row.original;
      return (
        <div className="font-mono text-sm">
          {record.clockOutTime ? format(record.clockOutTime, "HH:mm:ss") : "—"}
        </div>
      );
    },
  },
  {
    accessorKey: "totalWorkingMinutes",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-8 px-2 lg:px-3"
      >
        <Timer className="mr-2 h-4 w-4" />
        Working Time
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const record = row.original;
      const minutes = record.totalWorkingMinutes ?? 0;
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;

      return (
        <div className="flex items-center gap-2">
          <Timer className="text-muted-foreground h-3 w-3" />
          <span className="font-mono text-sm">
            {hours}h {remainingMinutes}m
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "totalBreakMinutes",
    header: () => (
      <div className="flex items-center gap-2">
        <Coffee className="h-4 w-4" />
        Break Time
      </div>
    ),
    cell: ({ row }) => {
      const record = row.original;
      const minutes = record.totalBreakMinutes ?? 0;
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;

      return (
        <div className="flex items-center gap-2">
          <Coffee className="text-muted-foreground h-3 w-3" />
          <span className="font-mono text-sm">
            {minutes > 0 ? `${hours}h ${remainingMinutes}m` : "—"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-8 px-2 lg:px-3"
      >
        Status
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const record = row.original;
      const config = statusConfig[record.status];
      const Icon = config.icon;

      return (
        <Badge variant={config.variant} className="gap-1">
          <Icon className="h-3 w-3" />
          {config.label}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const record = row.original;
      const meta = table.options.meta as AttendanceTableMeta;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(record.id)}
            >
              Copy record ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {meta?.onViewRecord && (
              <DropdownMenuItem onClick={() => meta.onViewRecord?.(record)}>
                View details
              </DropdownMenuItem>
            )}
            {meta?.onEditRecord && (
              <DropdownMenuItem onClick={() => meta.onEditRecord?.(record)}>
                Edit record
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
