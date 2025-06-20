"use client";

import { Button } from "@/components/ui/button";
import { Plus, Settings } from "lucide-react";
import { type LeaveType } from "../../constants";
import { leavePolicyColumns } from "./leave-policies-table-columns";
import { DataTable } from "@/components/ui/data-table/data-table";
import { useAbility } from "@/providers/ability-context";

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

type LeavePoliciesTableProps = {
  policies: LeavePolicy[];
  isLoading: boolean;
  onEdit: (policy: LeavePolicy) => void;
  onDelete: (policy: LeavePolicy) => void;
  onCreateNew: () => void;
};

export function LeavePoliciesTable({
  policies,
  isLoading,
  onEdit,
  onDelete,
  onCreateNew,
}: LeavePoliciesTableProps) {
  const ability = useAbility();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading policies...</div>
      </div>
    );
  }

  if (policies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Settings className="text-muted-foreground mb-4 h-12 w-12" />
        <h3 className="text-lg font-medium">No leave policies found</h3>
        <p className="text-muted-foreground mb-4">
          Create your first leave policy to get started
        </p>
        <Button onClick={onCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          Create Policy
        </Button>
      </div>
    );
  }

  return (
    <DataTable
      columns={leavePolicyColumns}
      initialState={{
        columnVisibility: {
          actions: ability.can("manage", "LeavePolicies"),
        },
      }}
      data={policies}
      meta={{
        onEdit,
        onDelete,
      }}
    />
  );
}
