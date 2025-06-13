"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2, Plus, Settings } from "lucide-react";
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

type LeavePoliciesTableProps = {
  policies: LeavePolicy[];
  isLoading: boolean;
  onEdit: (policy: LeavePolicy) => void;
  onDelete: (policyId: string) => void;
  onCreateNew: () => void;
  isDeleting: boolean;
};

export function LeavePoliciesTable({
  policies,
  isLoading,
  onEdit,
  onDelete,
  onCreateNew,
  isDeleting,
}: LeavePoliciesTableProps) {
  const getLeaveTypeInfo = (type: string) => {
    return LEAVE_TYPES.find((lt) => lt.value === type) ?? LEAVE_TYPES[0]!;
  };

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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Leave Type</TableHead>
          <TableHead>Allowed Days</TableHead>
          <TableHead>Carry Forward</TableHead>
          <TableHead>Max Carry Forward</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {policies.map((policy) => {
          const typeInfo = getLeaveTypeInfo(policy.leaveType);
          return (
            <TableRow key={policy.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span>{typeInfo.icon}</span>
                  <span className="font-medium">{typeInfo.label}</span>
                  <Badge variant="secondary" className={typeInfo.color}>
                    {policy.leaveType}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{policy.defaultAllowance} days</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={policy.carryForward ? "default" : "secondary"}>
                  {policy.carryForward ? "Yes" : "No"}
                </Badge>
              </TableCell>
              <TableCell>
                {policy.carryForward ? (
                  <Badge variant="outline">
                    {policy.maxCarryForward ?? 0} days
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">N/A</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(policy)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(policy.id)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
