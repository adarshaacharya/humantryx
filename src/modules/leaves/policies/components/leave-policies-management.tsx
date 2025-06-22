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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Plus, Settings, RefreshCw } from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { type LeaveType } from "../../constants";
import { LeavePoliciesTable } from "./leave-policies-table";
import { LeavePolicyFormDialog } from "./leave-policy-form-dialog";
import { LeavePolicyDeleteDialog } from "./leave-policy-delete-dialog";
import { authClient } from "@/server/auth/auth-client";
import { Can } from "@/components/can";

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
  const [policyToDelete, setPolicyToDelete] = useState<LeavePolicy | null>(
    null,
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const policiesQuery = api.leave.getLeavePolicies.useQuery();
  const { data: session } = authClient.useSession();

  const createPolicyMutation = api.leave.createLeavePolicy.useMutation({
    onSuccess: () => {
      toast.success(
        "Leave policy created successfully! Employee balances have been automatically initialized.",
      );
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
      toast.success(
        "Leave policy updated successfully! Employee balances have been automatically updated to reflect the changes.",
      );
      setEditDialogOpen(false);
      setSelectedPolicy(null);
      void policiesQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const syncBalancesMutation =
    api.leave.syncAllEmployeeLeaveBalances.useMutation({
      onSuccess: (result) => {
        toast.success(result.message);
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

  const handleDeletePolicy = (policy: LeavePolicy) => {
    setPolicyToDelete(policy);
    setIsDeleteDialogOpen(true);
  };

  const handleFormCancel = () => {
    setEditDialogOpen(false);
    setSelectedPolicy(null);
  };

  const handleSyncBalances = () => {
    if (!session?.session?.activeOrganizationId) {
      toast.error("Organization not found");
      return;
    }

    syncBalancesMutation.mutate({
      organizationId: session.session.activeOrganizationId,
    });
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
        <div className="flex items-center gap-2">
          <Can I="manage" a="LeavePolicies">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={handleSyncBalances}
                    disabled={syncBalancesMutation.isPending}
                  >
                    <RefreshCw
                      className={`mr-2 h-4 w-4 ${syncBalancesMutation.isPending ? "animate-spin" : ""}`}
                    />
                    {syncBalancesMutation.isPending
                      ? "Syncing..."
                      : "Sync Balances"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Sync leave balances for all employees based on current
                    policies.
                    <br />
                    This ensures all employees have correct leave balances.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Can>
          <Can I="create" a="LeavePolicies">
            <Button onClick={() => setEditDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Policy
            </Button>
          </Can>
        </div>
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
          />
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <LeavePolicyDeleteDialog
        policy={policyToDelete}
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onPolicyDeleted={() => {
          void policiesQuery.refetch();
        }}
      />
    </div>
  );
}
