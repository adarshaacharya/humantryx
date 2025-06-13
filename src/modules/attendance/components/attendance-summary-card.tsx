"use client";

import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Clock,
  Calendar,
  TrendingUp,
  Users,
  Coffee,
  Timer,
} from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

type AttendanceSummaryCardProps = {
  employeeId?: string;
  showEmployeeSelector?: boolean;
};

export function AttendanceSummaryCard({
  employeeId,
  showEmployeeSelector = false,
}: AttendanceSummaryCardProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(employeeId);

  const summaryQuery = api.attendance.getSummary.useQuery({
    employeeId: selectedEmployeeId,
    month: selectedMonth,
    year: selectedYear,
  });

  const employeesQuery = api.employee.list.useQuery(
    {
      organizationId: "",
      limit: 100,
      offset: 0,
    },
    {
      enabled: showEmployeeSelector,
    },
  );

  // Generate month options
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i,
    label: format(new Date(2023, i, 1), "MMMM"),
  }));

  // Generate year options (current year and previous 2 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 3 }, (_, i) => currentYear - i);

  if (summaryQuery.isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Attendance Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (summaryQuery.isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Attendance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-red-600">
            Failed to load attendance summary
          </div>
        </CardContent>
      </Card>
    );
  }

  const summary = summaryQuery.data;
  if (!summary) return null;

  const workingDaysInMonth = 22; // Approximate working days in a month
  const attendanceRate = (summary.totalDaysWorked / workingDaysInMonth) * 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Attendance Summary
          </CardTitle>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {showEmployeeSelector && (
            <Select
              value={selectedEmployeeId ?? ""}
              onValueChange={setSelectedEmployeeId}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Employee" />
              </SelectTrigger>
              <SelectContent>
                {employeesQuery.data?.employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.user?.name ?? "Unknown"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select
            value={selectedMonth.toString()}
            onValueChange={(value) => setSelectedMonth(parseInt(value))}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value.toString()}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedYear.toString()}
            onValueChange={(value) => setSelectedYear(parseInt(value))}
          >
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Users className="h-4 w-4" />
              Days Worked
            </div>
            <div className="text-primary text-2xl font-bold">
              {summary.totalDaysWorked}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              Total Hours
            </div>
            <div className="text-2xl font-bold text-green-600">
              {summary.totalWorkingHours}h {summary.totalWorkingMinutes}m
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Coffee className="h-4 w-4" />
              Break Time
            </div>
            <div className="text-2xl font-bold text-yellow-600">
              {summary.totalBreakHours}h {summary.totalBreakMinutes}m
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4" />
              Avg/Day
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {summary.averageWorkingHours.toFixed(1)}h
            </div>
          </div>
        </div>

        {/* Attendance Rate */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Attendance Rate</span>
            <Badge
              className={
                attendanceRate >= 90
                  ? "bg-green-100 text-green-800"
                  : attendanceRate >= 75
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
              }
            >
              {attendanceRate.toFixed(1)}%
            </Badge>
          </div>
          <Progress value={attendanceRate} className="h-2" />
          <div className="text-muted-foreground flex justify-between text-xs">
            <span>0 days</span>
            <span>{workingDaysInMonth} working days</span>
          </div>
        </div>

        {/* Recent Records Preview */}
        {summary.records.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Recent Activity</h4>
            <div className="space-y-2">
              {summary.records.slice(0, 3).map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between rounded-lg border p-2 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <Timer className="text-muted-foreground h-3 w-3" />
                    <span>{format(record.clockInTime, "MMM dd")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      {format(record.clockInTime, "HH:mm")} -{" "}
                      {record.clockOutTime
                        ? format(record.clockOutTime, "HH:mm")
                        : "Active"}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {record.totalWorkingMinutes
                        ? `${Math.floor(record.totalWorkingMinutes / 60)}h ${record.totalWorkingMinutes % 60}m`
                        : "In Progress"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
