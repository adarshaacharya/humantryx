"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  FileText,
  Settings,
  Users,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { api } from "@/trpc/react";
import { LEAVE_TYPES } from "../constants";

export function LeaveDashboard() {
  // Get recent leave requests for overview
  const recentRequestsQuery = api.leave.list.useQuery({
    page: 1,
    limit: 5,
  });

  const requests = recentRequestsQuery.data?.data ?? [];
  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div className="container mx-auto space-y-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Leave Management
          </h1>
          <p className="text-muted-foreground">
            Manage leave requests, balances, and policies
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Recent Requests
            </CardTitle>
            <FileText className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{requests.length}</div>
            <p className="text-muted-foreground text-xs">Last 5 requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {pendingCount}
            </div>
            <p className="text-muted-foreground text-xs">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leave Types</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {LEAVE_TYPES.length}
            </div>
            <p className="text-muted-foreground text-xs">Available types</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            <Settings className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-xs">
              Manage leaves efficiently
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="transition-shadow hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Leave Requests
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">
              Review and manage employee leave requests. Approve or reject
              pending applications.
            </p>
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {pendingCount} pending
              </Badge>
              <Link href="/dashboard/leaves/requests">
                <Button>View Requests</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-shadow hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              Leave Balances
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">
              Monitor employee leave balances and adjust allocations as needed.
            </p>
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Manage balances
              </Badge>
              <Link href="/dashboard/leaves/manage">
                <Button>Manage Balances</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-shadow hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-purple-600" />
              Leave Policies
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">
              Configure leave policies, types, and organization-wide settings.
            </p>
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {LEAVE_TYPES.length} types
              </Badge>
              <Link href="/dashboard/leaves/policies">
                <Button>View Policies</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Leave Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentRequestsQuery.isLoading ? (
            <p className="text-muted-foreground py-4 text-center">
              Loading recent activity...
            </p>
          ) : requests.length === 0 ? (
            <p className="text-muted-foreground py-4 text-center">
              No recent leave requests
            </p>
          ) : (
            <div className="space-y-3">
              {requests.slice(0, 3).map((request) => {
                const leaveType = LEAVE_TYPES.find(
                  (t) => t.value === request.leaveType,
                );
                return (
                  <div
                    key={request.id}
                    className="flex items-center justify-between border-b pb-2 last:border-b-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-lg">{leaveType?.icon}</div>
                      <div>
                        <p className="font-medium">Employee</p>
                        <p className="text-muted-foreground text-sm">
                          {leaveType?.label} - {request.totalDays} days
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        request.status === "pending"
                          ? "border-yellow-500 text-yellow-700"
                          : request.status === "approved"
                            ? "border-green-500 text-green-700"
                            : "border-red-500 text-red-700"
                      }
                    >
                      {request.status}
                    </Badge>
                  </div>
                );
              })}
              {requests.length > 3 && (
                <div className="pt-2 text-center">
                  <Link href="/dashboard/leaves/requests">
                    <Button variant="outline" size="sm">
                      View All Requests
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
