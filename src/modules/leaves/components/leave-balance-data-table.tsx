"use client";

import { useState, useCallback } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table/data-table";
import { AlertCircle, Plus } from "lucide-react";
import { authClient } from "@/server/auth/auth-client";

import { leaveBalanceColumns } from "./leave-balance-table-columns";
import { AdjustLeaveBalanceDialog } from "./adjust-leave-balance-dialog";

interface LeaveBalanceDataTableProps {
  employeeId?: string;
  userRole?: "hr" | "employee";
}

export function LeaveBalanceDataTable({
  employeeId,
  userRole = "employee",
}: LeaveBalanceDataTableProps) {
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);

  const { data: session } = authClient.useSession();
  const organizationId = session?.session?.activeOrganizationId;

  const leaveBalancesQuery = api.leave.getBalances.useQuery(
    {
      employeeId,
    },
    {
      enabled: !!organizationId,
    },
  );

  const handleAdjustBalance = useCallback(() => {
    setAdjustDialogOpen(true);
  }, []);

  const handleDialogSuccess = useCallback(() => {
    void leaveBalancesQuery.refetch();
  }, [leaveBalancesQuery]);

  if (!organizationId) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="space-y-2 text-center">
            <AlertCircle className="text-muted-foreground mx-auto h-8 w-8" />
            <p className="text-muted-foreground">No organization selected</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (leaveBalancesQuery.error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="space-y-4 text-center">
            <AlertCircle className="text-destructive mx-auto h-8 w-8" />
            <div>
              <p className="text-destructive font-medium">
                Error loading leave balances
              </p>
              <p className="text-muted-foreground text-sm">
                {leaveBalancesQuery.error.message}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => leaveBalancesQuery.refetch()}
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const leaveBalances = leaveBalancesQuery.data ?? [];

  return (
    <div className="space-y-6">
      {/* Leave Balances Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Leave Balances</CardTitle>
              <CardDescription>
                {`Showing ${leaveBalances.length} leave balance${leaveBalances.length !== 1 ? "s" : ""}`}
              </CardDescription>
            </div>
            {userRole === "hr" && (
              <Button onClick={handleAdjustBalance} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Adjust Balance
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={leaveBalanceColumns}
            data={leaveBalances}
            meta={{
              userRole,
            }}
          />
        </CardContent>
      </Card>

      {/* Adjust Balance Dialog */}
      <AdjustLeaveBalanceDialog
        open={adjustDialogOpen}
        onOpenChange={setAdjustDialogOpen}
        onSuccess={handleDialogSuccess}
      />
    </div>
  );
}
