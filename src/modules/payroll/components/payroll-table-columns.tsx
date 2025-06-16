"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpDown,
  MoreHorizontal,
  Eye,
  Download,
  CreditCard,
  FileText,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import type { PayrollRecord, PayrollTableMeta } from "../types";
import { getPaymentStatusBadge } from "../constants";
import { IdCell } from "@/components/id-cell";
import { useAbility } from "@/providers/ability-context";

export const payrollColumns: ColumnDef<PayrollRecord>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-8 px-2 lg:px-3"
      >
        ID
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <IdCell id={row.getValue("id")} />,
  },
  {
    accessorKey: "employee",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-8 px-2 lg:px-3"
      >
        Employee
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row, table }) => {
      const meta = table.options.meta as PayrollTableMeta;
      const record = row.original;

      if (!meta?.showEmployeeInfo) {
        return null;
      }

      return (
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 rounded-full p-1">
            <div className="bg-primary/20 flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium">
              {record.employee?.user?.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
          </div>
          <div>
            <div className="font-medium">
              {record.employee?.user?.name || "Unknown Employee"}
            </div>
            <div className="text-muted-foreground text-sm">
              {record.employee?.designation?.replace("_", " ").toUpperCase()}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "payrollMonth",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-8 px-2 lg:px-3"
      >
        Month
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const monthYear = row.getValue("payrollMonth") as string;
      const [year, month] = monthYear.split("-");
      const date = new Date(
        parseInt(year ?? "2024"),
        parseInt(month ?? "1") - 1,
      );
      return format(date, "MMMM yyyy");
    },
  },
  {
    accessorKey: "baseSalary",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-8 px-2 lg:px-3"
      >
        Base Salary
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("baseSalary"));
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);
    },
  },
  {
    accessorKey: "bonuses",
    header: "Bonuses",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("bonuses") ?? "0");
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);
    },
  },
  {
    accessorKey: "netPay",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-8 px-2 lg:px-3"
      >
        Net Pay
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("netPay"));
      return (
        <div className="font-medium">
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(amount)}
        </div>
      );
    },
  },
  {
    accessorKey: "paymentStatus",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("paymentStatus") as string;
      const statusConfig = getPaymentStatusBadge(status);
      const StatusIcon = statusConfig.icon;

      return (
        <Badge variant={statusConfig.variant} className="gap-1">
          <StatusIcon className="h-3 w-3" />
          {statusConfig.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-8 px-2 lg:px-3"
      >
        Generated
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
      return format(new Date(date), "MMM dd, yyyy");
    },
  },
  {
    id: "actions",
    cell: function ActionsCell({ row, table }) {
      const record = row.original;
      const meta = table.options.meta as PayrollTableMeta;

      const isLoading = meta?.isLoading && meta?.pendingActionId === record.id;
      const ability = useAbility();

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
            <DropdownMenuItem
              onClick={() => meta?.onViewPayroll?.(record)}
              className="cursor-pointer"
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => meta?.onGeneratePayslip?.(record)}
              className="cursor-pointer"
            >
              <FileText className="mr-2 h-4 w-4" />
              Preview Payslip
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => meta?.onQuickDownload?.(record)}
              className="cursor-pointer"
            >
              <Download className="mr-2 h-4 w-4" />
              Quick Download
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {ability.can("update", "Payroll") && (
              <DropdownMenuItem
                onClick={() => meta?.onUpdatePaymentStatus?.(record)}
                className="cursor-pointer"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Update Payment
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
