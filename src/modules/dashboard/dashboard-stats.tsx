"use client";

import { api } from "@/trpc/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  DollarSign,
  UserCheck,
  UserX,
  TrendingUp,
  TrendingDown,
  ClipboardList,
  Clock,
  Calendar,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AreaChartComponent } from "@/components/charts/area-chart";
import { useAbility } from "@/providers/ability-context";
import { useCurrentEmployee } from "@/hooks/use-current-employee";

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="mt-1 h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-60" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[200px] w-full" />
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-2 w-full" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-2 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function DashboardStats() {
  const ability = useAbility();
  const currentEmployee = useCurrentEmployee();
  const isAdmin = ability.can("manage", "Employee");
  const isManager = ability.can("update", "Employee");

  // Admin/HR/Founder can see organization stats
  if (isAdmin) {
    return <AdminDashboardStats />;
  }

  // Project managers see team-focused stats
  if (isManager) {
    return <ManagerDashboardStats />;
  }

  // Regular employees see only their personal stats
  return <EmployeeDashboardStats employeeId={currentEmployee?.id} />;
}

function AdminDashboardStats() {
  const dashboardQuery = api.dashboard.getStats?.useQuery();

  if (dashboardQuery.isLoading) {
    return <DashboardSkeleton />;
  }

  if (dashboardQuery.isError) {
    return (
      <div className="bg-destructive/15 text-destructive rounded-md p-4">
        Error loading dashboard: {dashboardQuery.error.message}
      </div>
    );
  }

  const stats = dashboardQuery.data;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Employees
            </CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalEmployees}</div>
            <p className="text-muted-foreground flex items-center text-xs">
              {(stats?.employeeGrowthPercent || 0) > 0 ? (
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              ) : (stats?.employeeGrowthPercent || 0) < 0 ? (
                <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
              ) : null}
              {(stats?.employeeGrowthPercent || 0) > 0 ? "+" : ""}
              {stats?.employeeGrowthPercent.toFixed(1)}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
            <UserCheck className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.presentToday}</div>
            <p className="text-muted-foreground text-xs">
              {stats?.attendanceRate.toFixed(1)}% attendance rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Leave</CardTitle>
            <UserX className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.onLeaveToday}</div>
            <p className="text-muted-foreground text-xs">
              {stats?.leaveRate.toFixed(1)}% of workforce
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Payroll
            </CardTitle>
            <DollarSign className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatter.format(stats?.monthlyPayroll || 0)}
            </div>
            <p className="text-muted-foreground flex items-center text-xs">
              {(stats?.payrollChangePercent || 0) > 0 ? (
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              ) : (stats?.payrollChangePercent || 0) < 0 ? (
                <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
              ) : null}
              {(stats?.payrollChangePercent || 0) > 0 ? "+" : ""}
              {(stats?.payrollChangePercent || 0).toFixed(1)}% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Attendance Trend Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Attendance Trend</CardTitle>
            <CardDescription>
              Daily attendance rate over the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AreaChartComponent
              data={stats?.attendanceTrend}
              categories={["percentage"]}
              index="date"
              colors={["#4ade80"]}
              valueFormatter={(value) => `${value}%`}
              height={250}
              startEndOnly={(stats?.attendanceTrend?.length || 0) > 15}
            />
          </CardContent>
        </Card>

        {/* Employee Growth Chart */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Employee Growth</CardTitle>
            <CardDescription>Monthly employee count trend</CardDescription>
          </CardHeader>
          <CardContent>
            <AreaChartComponent
              data={stats?.employeeTrend}
              categories={["count"]}
              index="month"
              colors={["#3b82f6"]}
              height={250}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ManagerDashboardStats() {
  const teamAttendanceQuery = api.dashboard.getTeamAttendance.useQuery();
  const teamLeaveQuery = api.dashboard.getPendingLeaveRequests.useQuery();

  if (teamAttendanceQuery.isLoading || teamLeaveQuery.isLoading) {
    return <DashboardSkeleton />;
  }

  if (teamAttendanceQuery.isError || teamLeaveQuery.isError) {
    return (
      <div className="bg-destructive/15 text-destructive rounded-md p-4">
        Error loading dashboard data:{" "}
        {teamAttendanceQuery.error?.message || teamLeaveQuery.error?.message}
      </div>
    );
  }

  const attendanceData = teamAttendanceQuery.data;
  const leaveData = teamLeaveQuery.data;

  return (
    <div className="space-y-6">
      {/* Stats Cards for Managers */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Size</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {attendanceData?.totalTeamMembers}
            </div>
            <p className="text-muted-foreground text-xs">Direct reports</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
            <UserCheck className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {attendanceData?.presentToday}
            </div>
            <p className="text-muted-foreground text-xs">
              {attendanceData?.attendanceRate.toFixed(1)}% of team
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Leave</CardTitle>
            <UserX className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {attendanceData?.onLeaveToday}
            </div>
            <p className="text-muted-foreground text-xs">
              {attendanceData?.leaveRate.toFixed(1)}% of team
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Leaves
            </CardTitle>
            <ClipboardList className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leaveData?.pendingRequests}
            </div>
            <p className="text-muted-foreground text-xs">
              Require your approval
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid for Managers */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-7">
          <CardHeader>
            <CardTitle>Team Attendance</CardTitle>
            <CardDescription>
              Daily team attendance over the last 14 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AreaChartComponent
              data={attendanceData?.teamAttendanceTrend}
              categories={["presentPercentage"]}
              index="date"
              colors={["#3b82f6"]}
              valueFormatter={(value) => `${value}%`}
              height={250}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function EmployeeDashboardStats({ employeeId }: { employeeId?: string }) {
  const personalStatsQuery = api.dashboard.getPersonalStats?.useQuery(
    { employeeId: employeeId || "" },
    { enabled: !!employeeId },
  );

  if (personalStatsQuery.isLoading || !employeeId) {
    return <DashboardSkeleton />;
  }

  if (personalStatsQuery.isError) {
    return (
      <div className="bg-destructive/15 text-destructive rounded-md p-4">
        Error loading personal data: {personalStatsQuery.error.message}
      </div>
    );
  }

  const stats = personalStatsQuery.data;

  return (
    <div className="space-y-6">
      {/* Stats Cards for Employees */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance</CardTitle>
            <Clock className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.attendanceRate.toFixed(1)}%
            </div>
            <p className="text-muted-foreground text-xs">For this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leave Balance</CardTitle>
            <Calendar className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.leaveBalance}</div>
            <p className="text-muted-foreground text-xs">Days remaining</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours Worked</CardTitle>
            <Clock className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.hoursWorked}</div>
            <p className="text-muted-foreground text-xs">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Payroll</CardTitle>
            <DollarSign className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatter.format(stats?.lastPayrollAmount || 0)}
            </div>
            <p className="text-muted-foreground text-xs">
              {stats?.lastPayrollDate || ""}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Employee's Attendance Chart */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-7">
          <CardHeader>
            <CardTitle>Your Attendance History</CardTitle>
            <CardDescription>
              Daily attendance record for the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AreaChartComponent
              data={stats?.attendanceHistory}
              categories={["hoursWorked"]}
              index="date"
              colors={["#4ade80"]}
              valueFormatter={(value) => `${value} hrs`}
              height={250}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
