"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Settings } from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { type LeaveType } from "../../constants";
import { LeavePoliciesTable } from "./leave-policies-table";
import { LeavePolicyFormDialog } from "./leave-policy-form-dialog";

type PolicyFormData = {
  leaveType: LeaveType;
  defaultAllowance: number;
  carryForward: boolean;
  maxCarryForward: number;
};

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

export function LeavePoliciesManagement() {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<LeavePolicy | null>(
    null,
  );

  const policiesQuery = api.leave.getLeavePolicies.useQuery();

  const createPolicyMutation = api.leave.createLeavePolicy.useMutation({
    onSuccess: () => {
      toast.success("Leave policy created successfully");
      setEditDialogOpen(false);
      setSelectedPolicy(null);
      void policiesQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updatePolicyMutation = api.leave.updateLeavePolicy.useMutation({
    onSuccess: () => {
      toast.success("Leave policy updated successfully");
      setEditDialogOpen(false);
      setSelectedPolicy(null);
      void policiesQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deletePolicyMutation = api.leave.deleteLeavePolicy.useMutation({
    onSuccess: () => {
      toast.success("Leave policy deleted successfully");
      void policiesQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleCreatePolicy = (data: PolicyFormData) => {
    if (selectedPolicy) {
      updatePolicyMutation.mutate({
        id: selectedPolicy.id,
        defaultAllowance: data.defaultAllowance,
        carryForward: data.carryForward,
        maxCarryForward: data.maxCarryForward,
      });
    } else {
      createPolicyMutation.mutate({
        leaveType: data.leaveType,
        defaultAllowance: data.defaultAllowance,
        carryForward: data.carryForward,
        maxCarryForward: data.maxCarryForward,
      });
    }
  };

  const handleEditPolicy = (policy: LeavePolicy) => {
    setSelectedPolicy(policy);
    setEditDialogOpen(true);
  };

  const handleDeletePolicy = (policyId: string) => {
    if (confirm("Are you sure you want to delete this leave policy?")) {
      deletePolicyMutation.mutate({ id: policyId });
    }
  };

  const handleFormCancel = () => {
    setEditDialogOpen(false);
    setSelectedPolicy(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Leave Policies</h1>
          <p className="text-muted-foreground">
            Manage leave policies and entitlements for your organization
          </p>
        </div>
        <Button onClick={() => setEditDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Policy
        </Button>
      </div>

      <LeavePolicyFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        selectedPolicy={selectedPolicy}
        onSubmit={handleCreatePolicy}
        onCancel={handleFormCancel}
        isSubmitting={
          createPolicyMutation.isPending || updatePolicyMutation.isPending
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Current Leave Policies
          </CardTitle>
          <CardDescription>
            Active leave policies for your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LeavePoliciesTable
            policies={policiesQuery.data ?? []}
            isLoading={policiesQuery.isLoading}
            onEdit={handleEditPolicy}
            onDelete={handleDeletePolicy}
            onCreateNew={() => setEditDialogOpen(true)}
            isDeleting={deletePolicyMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}
