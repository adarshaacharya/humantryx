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
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Trash2, Settings } from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { LEAVE_TYPES } from "../constants";
import { useForm } from "react-hook-form";

// Form type with all required fields for react-hook-form
type PolicyFormData = {
  leaveType:
    | "annual"
    | "sick"
    | "casual"
    | "maternity"
    | "paternity"
    | "emergency";
  defaultAllowance: number;
  carryForward: boolean;
  maxCarryForward: number;
};

type LeavePolicy = {
  id: string;
  leaveType:
    | "annual"
    | "sick"
    | "casual"
    | "maternity"
    | "paternity"
    | "emergency";
  defaultAllowance: number;
  carryForward: boolean;
  maxCarryForward: number | null;
  isActive: boolean;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export function LeavePoliciesPage() {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<LeavePolicy | null>(
    null,
  );

  const policiesQuery = api.leave.getLeavePolicies.useQuery();
  const createPolicyMutation = api.leave.createLeavePolicy.useMutation({
    onSuccess: () => {
      toast.success("Leave policy created successfully");
      setEditDialogOpen(false);
      form.reset();
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
      form.reset();
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

  const form = useForm<PolicyFormData>({
    defaultValues: {
      leaveType: "annual",
      defaultAllowance: 0,
      carryForward: false,
      maxCarryForward: 0,
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
    form.reset({
      leaveType: policy.leaveType,
      defaultAllowance: policy.defaultAllowance,
      carryForward: policy.carryForward,
      maxCarryForward: policy.maxCarryForward ?? 0,
    });
    setEditDialogOpen(true);
  };

  const handleDeletePolicy = (policyId: string) => {
    if (confirm("Are you sure you want to delete this leave policy?")) {
      deletePolicyMutation.mutate({ id: policyId });
    }
  };

  const getLeaveTypeInfo = (type: string) => {
    return LEAVE_TYPES.find((lt) => lt.value === type) ?? LEAVE_TYPES[0]!;
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
        <Dialog
          open={editDialogOpen}
          onOpenChange={(open) => {
            setEditDialogOpen(open);
            if (!open) {
              setSelectedPolicy(null);
              form.reset();
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Policy
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {selectedPolicy ? "Edit" : "Create"} Leave Policy
              </DialogTitle>
            </DialogHeader>
            <form
              onSubmit={form.handleSubmit(handleCreatePolicy)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="leaveType">Leave Type</Label>
                <Select
                  value={form.watch("leaveType")}
                  onValueChange={(value) =>
                    form.setValue(
                      "leaveType",
                      value as PolicyFormData["leaveType"],
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAVE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <span>{type.icon}</span>
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultAllowance">Allowed Days per Year</Label>
                <Input
                  id="defaultAllowance"
                  type="number"
                  min="0"
                  {...form.register("defaultAllowance", {
                    valueAsNumber: true,
                  })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="carryForward"
                  {...form.register("carryForward")}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="carryForward">
                  Allow carry forward to next year
                </Label>
              </div>

              {form.watch("carryForward") && (
                <div className="space-y-2">
                  <Label htmlFor="maxCarryForward">
                    Max Days to Carry Forward
                  </Label>
                  <Input
                    id="maxCarryForward"
                    type="number"
                    min="0"
                    {...form.register("maxCarryForward", {
                      valueAsNumber: true,
                    })}
                  />
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditDialogOpen(false);
                    setSelectedPolicy(null);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    createPolicyMutation.isPending ||
                    updatePolicyMutation.isPending
                  }
                >
                  {selectedPolicy ? "Update" : "Create"} Policy
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

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
          {policiesQuery.isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading policies...</div>
            </div>
          ) : policiesQuery.data?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Settings className="text-muted-foreground mb-4 h-12 w-12" />
              <h3 className="text-lg font-medium">No leave policies found</h3>
              <p className="text-muted-foreground mb-4">
                Create your first leave policy to get started
              </p>
              <Button onClick={() => setEditDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Policy
              </Button>
            </div>
          ) : (
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
                {policiesQuery.data?.map((policy) => {
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
                        <Badge variant="outline">
                          {policy.defaultAllowance} days
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            policy.carryForward ? "default" : "secondary"
                          }
                        >
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
                            onClick={() => handleEditPolicy(policy)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePolicy(policy.id)}
                            disabled={deletePolicyMutation.isPending}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
