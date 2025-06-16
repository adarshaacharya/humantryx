"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  TrendingUp,
  AlertCircle,
  Settings,
  ExternalLink,
  UserPlus,
} from "lucide-react";
import { LeaveBalanceDataTable } from "./leave-balance/leave-balance-data-table";
import { AdjustLeaveBalanceDialog } from "./leave-balance/adjust-leave-balance-dialog";
import { InitializeLeaveBalancesDialog } from "./leave-balance/initialize-leave-balances-dialog";
import { LEAVE_TYPES } from "../constants";
import Link from "next/link";

export function LeavesManagement() {
  const [showBalanceAdjustment, setShowBalanceAdjustment] = useState(false);
  const [showInitializeBalances, setShowInitializeBalances] = useState(false);

  return (
    <div className="container mx-auto space-y-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Leave Balance Management
          </h1>
          <p className="text-muted-foreground">
            Manage employee leave balances and entitlements
          </p>
        </div>

        <div className="flex gap-2">
          <Link href="/dashboard/leaves/requests">
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              View Requests
              <ExternalLink className="ml-2 h-3 w-3" />
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => setShowInitializeBalances(true)}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Initialize Balances
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowBalanceAdjustment(true)}
          >
            <Settings className="mr-2 h-4 w-4" />
            Adjust Balance
          </Button>
        </div>
      </div>

      {/* Quick Actions Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leave Types</CardTitle>
            <Calendar className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{LEAVE_TYPES.length}</div>
            <p className="text-muted-foreground text-xs">
              Available leave types
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            <Settings className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => setShowBalanceAdjustment(true)}
              >
                Adjust Balance
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">View Requests</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link href="/dashboard/leaves/requests">
                <Button size="sm" variant="outline" className="w-full">
                  Manage Requests
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Policies</CardTitle>
            <AlertCircle className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link href="/dashboard/leaves/policies">
                <Button size="sm" variant="outline" className="w-full">
                  View Policies
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leave Types Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Available Leave Types
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 md:grid-cols-6">
            {LEAVE_TYPES.map((leaveType) => (
              <div key={leaveType.value} className="space-y-2 text-center">
                <div className="text-2xl">{leaveType.icon}</div>
                <div className="text-sm font-medium">{leaveType.label}</div>
                <Badge variant="outline" className={leaveType.color}>
                  {leaveType.value}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Leave Balances Table */}
      <LeaveBalanceDataTable userRole="hr" />

      {/* Initialize Leave Balances Dialog */}
      <InitializeLeaveBalancesDialog
        open={showInitializeBalances}
        onOpenChange={setShowInitializeBalances}
      />

      {/* Adjust Leave Balance Dialog */}
      <AdjustLeaveBalanceDialog
        open={showBalanceAdjustment}
        onOpenChange={setShowBalanceAdjustment}
      />
    </div>
  );
}
