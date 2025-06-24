"use client";

import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LEAVE_TYPES } from "../constants";
import { Calendar, Clock, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type LeaveBalanceCardProps = {
  employeeId?: string;
  year?: number;
};

export function LeaveBalanceCard({ employeeId, year }: LeaveBalanceCardProps) {
  const currentYear = year ?? new Date().getFullYear();

  const balancesQuery = api.leave.getBalances.useQuery({
    employeeId,
  });

  if (balancesQuery.isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Leave Balances
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-2 w-full" />
              <div className="flex justify-between">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (balancesQuery.isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Leave Balances
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground py-6 text-center">
            Failed to load leave balances
          </div>
        </CardContent>
      </Card>
    );
  }

  const balances = balancesQuery.data ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Leave Balances ({currentYear})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {balances.length === 0 ? (
          <div className="py-8 text-center">
            <div className="bg-muted mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
              <Calendar className="text-muted-foreground h-6 w-6" />
            </div>
            <p className="text-muted-foreground mb-2">
              No leave balances found for {currentYear}
            </p>
            <p className="text-muted-foreground text-sm">
              Your leave balances will be automatically initialized based on
              your organization&apos;s leave policies when you first access this
              page.
            </p>
          </div>
        ) : (
          balances.map((balance) => {
            const leaveConfig = LEAVE_TYPES.find(
              (lt) => lt.value === balance.leaveType,
            );
            const usagePercentage =
              balance.totalAllowed > 0
                ? (balance.used / balance.totalAllowed) * 100
                : 0;

            return (
              <div key={balance.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{leaveConfig?.icon}</span>
                    <span className="font-medium">{leaveConfig?.label}</span>
                  </div>
                  <Badge variant="outline" className={leaveConfig?.color}>
                    {balance.remaining} left
                  </Badge>
                </div>

                <div className="space-y-2">
                  <Progress value={usagePercentage} className="h-2" />
                  <div className="text-muted-foreground flex justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Used: {balance.used}
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      Total: {balance.totalAllowed}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
