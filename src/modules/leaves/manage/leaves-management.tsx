"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Calendar,
  Clock,
  TrendingUp,
  AlertCircle,
  Settings,
} from "lucide-react";
import { LeaveRequestsDataTable } from "../components/leave-requests-data-table";
import { LeaveBalanceDataTable } from "../components/leave-balance-data-table";
import { AdjustLeaveBalanceDialog } from "../components/adjust-leave-balance-dialog";
import { LEAVE_TYPES } from "../constants";

export function LeavesManagement() {
  const [showBalanceAdjustment, setShowBalanceAdjustment] = useState(false);

  // Get statistics
  const statsQuery = api.leave.list.useQuery({
    page: 1,
    limit: 100, // Get recent requests for stats
  });

  const requests = statsQuery.data?.data ?? [];

  // Calculate stats
  const totalRequests = requests.length;
  const pendingRequests = requests.filter((r) => r.status === "pending").length;
  const approvedRequests = requests.filter(
    (r) => r.status === "approved",
  ).length;
  const rejectedRequests = requests.filter(
    (r) => r.status === "rejected",
  ).length;

  return (
    <div className="container mx-auto space-y-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Leave Management
          </h1>
          <p className="text-muted-foreground">
            Manage employee leave requests and balances
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowBalanceAdjustment(true)}
          >
            <Settings className="mr-2 h-4 w-4" />
            Adjust Balance
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Requests
            </CardTitle>
            <Calendar className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequests}</div>
            <p className="text-muted-foreground text-xs">All time requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {pendingRequests}
            </div>
            <p className="text-muted-foreground text-xs">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {approvedRequests}
            </div>
            <p className="text-muted-foreground text-xs">This period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {rejectedRequests}
            </div>
            <p className="text-muted-foreground text-xs">This period</p>
          </CardContent>
        </Card>
      </div>

      {/* Leave Types Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Leave Types Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 md:grid-cols-6">
            {LEAVE_TYPES.map((leaveType) => {
              const typeRequests = requests.filter(
                (r) => r.leaveType === leaveType.value,
              );
              return (
                <div key={leaveType.value} className="space-y-2 text-center">
                  <div className="text-2xl">{leaveType.icon}</div>
                  <div className="text-sm font-medium">{leaveType.label}</div>
                  <Badge variant="outline" className={leaveType.color}>
                    {typeRequests.length} requests
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Leave Balances Table */}
      <LeaveBalanceDataTable userRole="hr" />

      {/* Leave Requests Table */}
      <LeaveRequestsDataTable
        showFilters={true}
        employeeId={undefined}
        userRole="hr"
      />

      {/* Adjust Leave Balance Dialog */}
      <AdjustLeaveBalanceDialog
        open={showBalanceAdjustment}
        onOpenChange={setShowBalanceAdjustment}
      />
    </div>
  );
}
