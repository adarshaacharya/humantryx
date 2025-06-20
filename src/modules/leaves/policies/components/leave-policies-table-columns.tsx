"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import { LEAVE_TYPES, type LeaveType } from "../../constants";

type LeavePolicy = {
  id: string;
  leaveType: LeaveType;
  defaultAllowance: number;
  carryForward: boolean;
  maxCarryForward: number | null;
  isActive: boolean;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

interface LeavePolicyTableMeta {
  onEdit: (policy: LeavePolicy) => void;
  onDelete: (policy: LeavePolicy) => void;
}

const getLeaveTypeInfo = (type: string) => {
  return LEAVE_TYPES.find((lt) => lt.value === type) ?? LEAVE_TYPES[0]!;
};

export const leavePolicyColumns: ColumnDef<LeavePolicy>[] = [
  {
    accessorKey: "leaveType",
    header: "Leave Type",
    cell: ({ row }) => {
      const policy = row.original;
      const typeInfo = getLeaveTypeInfo(policy.leaveType);

      return (
        <div className="flex items-center gap-2">
          <span>{typeInfo.icon}</span>
          <span className="font-medium">{typeInfo.label}</span>
          <Badge variant="secondary" className={typeInfo.color}>
            {policy.leaveType}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "defaultAllowance",
    header: "Allowed Days",
    cell: ({ row }) => {
      const allowance = row.getValue("defaultAllowance") as number;
      return <Badge variant="outline">{allowance} days</Badge>;
    },
  },
  {
    accessorKey: "carryForward",
    header: "Carry Forward",
    cell: ({ row }) => {
      const carryForward = row.getValue("carryForward") as boolean;
      return (
        <Badge variant={carryForward ? "default" : "secondary"}>
          {carryForward ? "Yes" : "No"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "maxCarryForward",
    header: "Max Carry Forward",
    cell: ({ row }) => {
      const policy = row.original;
      return policy.carryForward ? (
        <Badge variant="outline">{policy.maxCarryForward ?? 0} days</Badge>
      ) : (
        <span className="text-muted-foreground">N/A</span>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: function ActionsCell({ row, table }) {
      const policy = row.original;
      const meta = table.options.meta as LeavePolicyTableMeta;

      return (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => meta?.onEdit?.(policy)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => meta?.onDelete?.(policy)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
