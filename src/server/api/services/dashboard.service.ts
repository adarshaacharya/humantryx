import { TRPCError } from "@trpc/server";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/server/db";
import { employees } from "@/server/db/schema";
import { attendanceRecords } from "@/server/db/attendance";
import { payrollRecords } from "@/server/db/schema";
import { leaveRequests } from "@/server/db/leaves";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";

type Session = {
  user: { id: string };
  session: { activeOrganizationId?: string | null | undefined };
};

export class DashboardService {
  static async validateEmployee(userId: string) {
    const employee = await db.query.employees.findFirst({
      where: eq(employees.userId, userId),
      with: {
        user: true,
      },
    });

    if (!employee) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Employee record not found",
      });
    }

    return employee;
  }

  static async getDashboardStats(session: Session) {
    const activeOrgId = session.session.activeOrganizationId;

    if (!activeOrgId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No active organization selected",
      });
    }

    // Validate employee and check if they have HR access
    const employee = await this.validateEmployee(session.user.id);
    const isHRAdmin = ["hr", "founder"].includes(employee.designation);

    if (!isHRAdmin) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only HR and Admin can access dashboard statistics",
      });
    }

    // Get total employees count
    const employeesResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(employees)
      .where(
        and(
          eq(employees.organizationId, activeOrgId),
          sql`${employees.deletedAt} IS NULL`,
        ),
      );

    const totalEmployees = Number(employeesResult[0]?.count) || 0;

    // Get employee count from previous month for growth calculation
    const lastMonth = subMonths(new Date(), 1);
    const twoMonthsAgo = subMonths(new Date(), 2);

    const lastMonthEmployeesResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(employees)
      .where(
        and(
          eq(employees.organizationId, activeOrgId),
          sql`${employees.createdAt} <= ${endOfMonth(lastMonth).toISOString()}`,
          sql`${employees.deletedAt} IS NULL`,
        ),
      );

    const twoMonthsAgoEmployeesResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(employees)
      .where(
        and(
          eq(employees.organizationId, activeOrgId),
          sql`${employees.createdAt} <= ${endOfMonth(twoMonthsAgo).toISOString()}`,
          sql`${employees.deletedAt} IS NULL`,
        ),
      );

    const lastMonthEmployees = Number(lastMonthEmployeesResult[0]?.count) || 0;
    const twoMonthsAgoEmployees =
      Number(twoMonthsAgoEmployeesResult[0]?.count) || 0;

    // Calculate employee growth percentage
    const employeeGrowthPercent =
      twoMonthsAgoEmployees === 0
        ? 0
        : ((lastMonthEmployees - twoMonthsAgoEmployees) /
            twoMonthsAgoEmployees) *
          100;

    // Get attendance stats for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const presentTodayResult = await db
      .select({
        count: sql<number>`count(distinct ${attendanceRecords.employeeId})`,
      })
      .from(attendanceRecords)
      .innerJoin(employees, eq(attendanceRecords.employeeId, employees.id))
      .where(
        and(
          sql`${attendanceRecords.clockInTime} >= ${today.toISOString()}`,
          sql`${attendanceRecords.clockInTime} < ${tomorrow.toISOString()}`,
          eq(employees.organizationId, activeOrgId),
          sql`${employees.deletedAt} IS NULL`,
        ),
      );

    const presentToday = Number(presentTodayResult[0]?.count) || 0;
    const attendanceRate =
      totalEmployees > 0 ? (presentToday / totalEmployees) * 100 : 0;

    // Get leave stats for today
    const onLeaveResult = await db
      .select({
        count: sql<number>`count(distinct ${leaveRequests.employeeId})`,
      })
      .from(leaveRequests)
      .innerJoin(employees, eq(leaveRequests.employeeId, employees.id))
      .where(
        and(
          sql`${leaveRequests.startDate} <= ${format(today, "yyyy-MM-dd")}`,
          sql`${leaveRequests.endDate} >= ${format(today, "yyyy-MM-dd")}`,
          eq(leaveRequests.status, "approved"),
          eq(employees.organizationId, activeOrgId),
          sql`${employees.deletedAt} IS NULL`,
        ),
      );

    const onLeaveToday = Number(onLeaveResult[0]?.count) || 0;
    const leaveRate =
      totalEmployees > 0 ? (onLeaveToday / totalEmployees) * 100 : 0;

    // Get current month payroll total
    const currentMonth = format(new Date(), "yyyy-MM");

    const payrollResult = await db
      .select({
        total: sql<string>`sum(cast(${payrollRecords.netPay} as decimal))`,
      })
      .from(payrollRecords)
      .innerJoin(employees, eq(payrollRecords.employeeId, employees.id))
      .where(
        and(
          eq(payrollRecords.payrollMonth, currentMonth),
          eq(employees.organizationId, activeOrgId),
        ),
      );

    const monthlyPayroll = Number(payrollResult[0]?.total || 0);

    // Get last month's payroll for comparison
    const lastMonthDate = format(subMonths(new Date(), 1), "yyyy-MM");

    const lastMonthPayrollResult = await db
      .select({
        total: sql<string>`sum(cast(${payrollRecords.netPay} as decimal))`,
      })
      .from(payrollRecords)
      .innerJoin(employees, eq(payrollRecords.employeeId, employees.id))
      .where(
        and(
          eq(payrollRecords.payrollMonth, lastMonthDate),
          eq(employees.organizationId, activeOrgId),
        ),
      );

    const lastMonthPayroll = Number(lastMonthPayrollResult[0]?.total || 0);

    // Calculate payroll change percentage
    const payrollChangePercent =
      lastMonthPayroll === 0
        ? 0
        : ((monthlyPayroll - lastMonthPayroll) / lastMonthPayroll) * 100;

    // Get employee trend data for the last 6 months
    const employeeTrend = await this.getEmployeeTrendData(activeOrgId);

    // Get attendance trend data for the last 30 days
    const attendanceTrend = await this.getAttendanceTrendData(activeOrgId);

    return {
      totalEmployees,
      employeeGrowthPercent,
      presentToday,
      attendanceRate,
      onLeaveToday,
      leaveRate,
      monthlyPayroll,
      payrollChangePercent,
      employeeTrend,
      attendanceTrend,
    };
  }

  static async getEmployeeTrendData(organizationId: string) {
    const months = 6;
    const result = [];

    for (let i = 0; i < months; i++) {
      const targetMonth = subMonths(new Date(), i);
      const monthStart = startOfMonth(targetMonth);
      const monthEnd = endOfMonth(targetMonth);

      const employeeCountResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(employees)
        .where(
          and(
            eq(employees.organizationId, organizationId),
            sql`${employees.createdAt} <= ${monthEnd.toISOString()}`,
            sql`(${employees.deletedAt} IS NULL OR ${employees.deletedAt} > ${monthEnd.toISOString()})`,
          ),
        );

      result.unshift({
        month: format(targetMonth, "MMM"),
        count: Number(employeeCountResult[0]?.count) || 0,
      });
    }

    return result;
  }

  static async getAttendanceTrendData(organizationId: string) {
    const days = 30;
    const result = [];

    for (let i = days - 1; i >= 0; i--) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - i);
      targetDate.setHours(0, 0, 0, 0);

      const nextDate = new Date(targetDate);
      nextDate.setDate(nextDate.getDate() + 1);

      const attendanceResult = await db
        .select({
          count: sql<number>`count(distinct ${attendanceRecords.employeeId})`,
        })
        .from(attendanceRecords)
        .innerJoin(employees, eq(attendanceRecords.employeeId, employees.id))
        .where(
          and(
            sql`${attendanceRecords.clockInTime} >= ${targetDate.toISOString()}`,
            sql`${attendanceRecords.clockInTime} < ${nextDate.toISOString()}`,
            eq(employees.organizationId, organizationId),
            sql`${employees.deletedAt} IS NULL`,
          ),
        );

      const employeeCountResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(employees)
        .where(
          and(
            eq(employees.organizationId, organizationId),
            sql`${employees.createdAt} <= ${targetDate.toISOString()}`,
            sql`(${employees.deletedAt} IS NULL OR ${employees.deletedAt} > ${targetDate.toISOString()})`,
          ),
        );

      const attendanceCount = Number(attendanceResult[0]?.count) || 0;
      const employeeCount = Number(employeeCountResult[0]?.count) || 0;

      const percentage =
        employeeCount > 0 ? (attendanceCount / employeeCount) * 100 : 0;

      result.push({
        date: format(targetDate, "dd MMM"),
        percentage: Math.round(percentage),
        count: attendanceCount,
        total: employeeCount,
      });
    }

    return result;
  }

  static async getTeamAttendanceStats(session: Session) {
    const activeOrgId = session.session.activeOrganizationId;

    if (!activeOrgId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No active organization selected",
      });
    }

    // Validate manager access
    const employee = await this.validateEmployee(session.user.id);
    const isManager = employee.designation === "project_manager";

    if (!isManager) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only project managers can access team statistics",
      });
    }

    // Since reportingManagerId is not in the schema yet, we'll simulate a team for demo purposes
    // In a real implementation, you'd have proper reporting relationships
    const teamMembers = await db.query.employees.findMany({
      where: and(
        eq(employees.organizationId, activeOrgId),
        sql`${employees.id} != ${employee.id}`, // exclude self
      ),
      limit: 5,
    });

    const teamMemberIds = teamMembers.map((member) => member.id);

    // If team is empty, return empty stats
    if (teamMemberIds.length === 0) {
      return {
        totalTeamMembers: 0,
        presentToday: 0,
        attendanceRate: 0,
        onLeaveToday: 0,
        leaveRate: 0,
        teamAttendanceTrend: Array(14)
          .fill(0)
          .map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (13 - i));
            return {
              date: format(date, "MMM dd"),
              presentPercentage: 0,
            };
          }),
      };
    }

    const totalTeamMembers = teamMemberIds.length;

    // Get attendance stats for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let presentTodayResult;
    if (teamMemberIds.length > 0) {
      presentTodayResult = await db
        .select({
          count: sql<number>`count(distinct ${attendanceRecords.employeeId})`,
        })
        .from(attendanceRecords)
        .where(
          and(
            sql`${attendanceRecords.employeeId} IN (${teamMemberIds.join(",")})`,
            sql`${attendanceRecords.clockInTime} >= ${today.toISOString()}`,
            sql`${attendanceRecords.clockInTime} < ${tomorrow.toISOString()}`,
          ),
        );
    } else {
      presentTodayResult = [{ count: 0 }];
    }

    const presentToday = Number(presentTodayResult[0]?.count) || 0;
    const attendanceRate =
      totalTeamMembers > 0 ? (presentToday / totalTeamMembers) * 100 : 0;

    // Get leave stats for today
    let onLeaveResult;
    if (teamMemberIds.length > 0) {
      onLeaveResult = await db
        .select({
          count: sql<number>`count(distinct ${leaveRequests.employeeId})`,
        })
        .from(leaveRequests)
        .where(
          and(
            sql`${leaveRequests.employeeId} IN (${teamMemberIds.join(",")})`,
            sql`${leaveRequests.startDate} <= ${format(today, "yyyy-MM-dd")}`,
            sql`${leaveRequests.endDate} >= ${format(today, "yyyy-MM-dd")}`,
            eq(leaveRequests.status, "approved"),
          ),
        );
    } else {
      onLeaveResult = [{ count: 0 }];
    }

    const onLeaveToday = Number(onLeaveResult[0]?.count) || 0;
    const leaveRate =
      totalTeamMembers > 0 ? (onLeaveToday / totalTeamMembers) * 100 : 0;

    // Get team attendance trend data for the last 14 days
    const teamAttendanceTrend =
      await this.getTeamAttendanceTrendData(teamMemberIds);

    return {
      totalTeamMembers,
      presentToday,
      attendanceRate,
      onLeaveToday,
      leaveRate,
      teamAttendanceTrend,
    };
  }

  static async getTeamAttendanceTrendData(teamMemberIds: string[]) {
    const days = 14;
    const result = [];

    for (let i = days - 1; i >= 0; i--) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - i);
      targetDate.setHours(0, 0, 0, 0);

      const nextDate = new Date(targetDate);
      nextDate.setDate(nextDate.getDate() + 1);

      let attendanceResult;
      if (teamMemberIds.length > 0) {
        attendanceResult = await db
          .select({
            count: sql<number>`count(distinct ${attendanceRecords.employeeId})`,
          })
          .from(attendanceRecords)
          .where(
            and(
              sql`${attendanceRecords.employeeId} IN (${teamMemberIds.join(",")})`,
              sql`${attendanceRecords.clockInTime} >= ${targetDate.toISOString()}`,
              sql`${attendanceRecords.clockInTime} < ${nextDate.toISOString()}`,
            ),
          );
      } else {
        attendanceResult = [{ count: 0 }];
      }

      const attendanceCount = Number(attendanceResult[0]?.count) || 0;
      const presentPercentage =
        teamMemberIds.length > 0
          ? (attendanceCount / teamMemberIds.length) * 100
          : 0;

      result.push({
        date: format(targetDate, "MMM dd"),
        presentPercentage: Number(presentPercentage.toFixed(1)),
      });
    }

    return result;
  }

  static async getTeamLeaveStats(session: Session) {
    const activeOrgId = session.session.activeOrganizationId;

    if (!activeOrgId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No active organization selected",
      });
    }

    // Validate manager access
    const employee = await this.validateEmployee(session.user.id);
    const isManager = employee.designation === "project_manager";

    if (!isManager) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only project managers can access team statistics",
      });
    }

    // Since reportingManagerId is not in the schema yet, we'll simulate team leave requests
    // In a real implementation, you'd get pending leave requests from team members
    const pendingLeaveRequests = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(leaveRequests)
      .innerJoin(employees, eq(leaveRequests.employeeId, employees.id))
      .where(
        and(
          eq(leaveRequests.status, "pending"),
          eq(employees.organizationId, activeOrgId),
        ),
      )
      .limit(10); // Just get a sample of pending requests

    return {
      pendingRequests: Number(pendingLeaveRequests[0]?.count) || 0,
    };
  }

  static async getPersonalDashboardStats(session: Session, employeeId: string) {
    const activeOrgId = session.session.activeOrganizationId;

    if (!activeOrgId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No active organization selected",
      });
    }

    // Validate employee access
    const employee = await this.validateEmployee(session.user.id);

    // Regular employees can only view their own stats
    if (
      employee.designation !== "founder" &&
      employee.designation !== "hr" &&
      employee.id !== employeeId
    ) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You can only view your own statistics",
      });
    }

    // Get current month attendance rate
    const currentMonth = new Date();
    const startOfCurrentMonth = startOfMonth(currentMonth);
    const endOfCurrentMonth = endOfMonth(currentMonth);
    const workdaysInMonth = this.getWorkdaysInMonth(
      startOfCurrentMonth,
      endOfCurrentMonth,
    );

    const attendanceResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(attendanceRecords)
      .where(
        and(
          eq(attendanceRecords.employeeId, employeeId),
          sql`${attendanceRecords.clockInTime} >= ${startOfCurrentMonth.toISOString()}`,
          sql`${attendanceRecords.clockInTime} <= ${endOfCurrentMonth.toISOString()}`,
        ),
      );

    const daysPresent = Number(attendanceResult[0]?.count) || 0;
    const attendanceRate =
      workdaysInMonth > 0 ? (daysPresent / workdaysInMonth) * 100 : 0;

    // Get leave balance
    const leaveBalance = 20; // Default value, should be fetched from a leave policy table in a real implementation

    // Get hours worked this month
    const hoursWorkedResult = await db
      .select({
        totalHours: sql<string>`sum(
          CASE
            WHEN ${attendanceRecords.clockOutTime} IS NULL THEN 0
            ELSE EXTRACT(EPOCH FROM (${attendanceRecords.clockOutTime} - ${attendanceRecords.clockInTime})) / 3600
          END
        )`,
      })
      .from(attendanceRecords)
      .where(
        and(
          eq(attendanceRecords.employeeId, employeeId),
          sql`${attendanceRecords.clockInTime} >= ${startOfCurrentMonth.toISOString()}`,
          sql`${attendanceRecords.clockInTime} <= ${endOfCurrentMonth.toISOString()}`,
        ),
      );

    const hoursWorked = Math.round(
      Number(hoursWorkedResult[0]?.totalHours) || 0,
    );

    // Get last payroll
    const lastPayrollResult = await db
      .select({
        amount: payrollRecords.netPay,
        payDate: payrollRecords.createdAt,
      })
      .from(payrollRecords)
      .where(eq(payrollRecords.employeeId, employeeId))
      .orderBy(sql`${payrollRecords.createdAt} DESC`)
      .limit(1);

    const lastPayroll = lastPayrollResult[0];

    // Get attendance history for the last 30 days
    const attendanceHistory =
      await this.getPersonalAttendanceHistory(employeeId);

    return {
      attendanceRate,
      leaveBalance,
      hoursWorked,
      lastPayrollAmount: lastPayroll?.amount ? Number(lastPayroll.amount) : 0,
      lastPayrollDate: lastPayroll?.payDate
        ? format(new Date(lastPayroll.payDate), "MMM dd, yyyy")
        : "No payroll yet",
      attendanceHistory,
    };
  }

  static getWorkdaysInMonth(start: Date, end: Date) {
    let count = 0;
    const current = new Date(start);

    while (current <= end) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) {
        // Skip weekends (0 = Sunday, 6 = Saturday)
        count++;
      }
      current.setDate(current.getDate() + 1);
    }

    return count;
  }

  static async getPersonalAttendanceHistory(employeeId: string) {
    const days = 30;
    const result = [];

    for (let i = days - 1; i >= 0; i--) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - i);
      targetDate.setHours(0, 0, 0, 0);

      const nextDate = new Date(targetDate);
      nextDate.setDate(nextDate.getDate() + 1);

      // Get hours worked on this day
      const hoursWorkedResult = await db
        .select({
          totalHours: sql<string>`sum(
            CASE
              WHEN ${attendanceRecords.clockOutTime} IS NULL THEN 0
              ELSE EXTRACT(EPOCH FROM (${attendanceRecords.clockOutTime} - ${attendanceRecords.clockInTime})) / 3600
            END
          )`,
        })
        .from(attendanceRecords)
        .where(
          and(
            eq(attendanceRecords.employeeId, employeeId),
            sql`${attendanceRecords.clockInTime} >= ${targetDate.toISOString()}`,
            sql`${attendanceRecords.clockInTime} < ${nextDate.toISOString()}`,
          ),
        );

      result.push({
        date: format(targetDate, "MMM dd"),
        hoursWorked: Number(
          Number(hoursWorkedResult[0]?.totalHours || 0).toFixed(1),
        ),
      });
    }

    return result;
  }
}
