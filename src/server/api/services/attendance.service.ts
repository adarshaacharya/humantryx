import { TRPCError } from "@trpc/server";
import { and, eq, gte, lte, desc, sql, isNull, isNotNull } from "drizzle-orm";
import { db } from "@/server/db";
import { employees } from "@/server/db/schema";
import { attendanceRecords } from "@/server/db/attendance";

type Session = {
  user: { id: string };
  session: { activeOrganizationId?: string | null | undefined };
};

export class AttendanceService {
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

  static async validateHRAccess(session: Session) {
    const employee = await this.validateEmployee(session.user.id);

    if (!["hr", "founder"].includes(employee.designation)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only HR and Admin can access this feature",
      });
    }

    return employee;
  }

  static async clockIn(session: Session, notes?: string) {
    const employee = await this.validateEmployee(session.user.id);

    // Check if already clocked in
    const existingRecord = await db.query.attendanceRecords.findFirst({
      where: and(
        eq(attendanceRecords.employeeId, employee.id),
        eq(attendanceRecords.status, "clocked_in"),
      ),
    });

    if (existingRecord) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Already clocked in. Please clock out first.",
      });
    }

    const [record] = await db
      .insert(attendanceRecords)
      .values({
        employeeId: employee.id,
        clockInTime: new Date(),
        status: "clocked_in",
        notes,
      })
      .returning();

    return record;
  }

  static async clockOut(session: Session, notes?: string) {
    const employee = await this.validateEmployee(session.user.id);

    // Find the active clock-in record
    const activeRecord = await db.query.attendanceRecords.findFirst({
      where: and(
        eq(attendanceRecords.employeeId, employee.id),
        eq(attendanceRecords.status, "clocked_in"),
      ),
    });

    if (!activeRecord) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No active clock-in record found. Please clock in first.",
      });
    }

    const clockOutTime = new Date();
    const workingMinutes = Math.floor(
      (clockOutTime.getTime() - activeRecord.clockInTime.getTime()) /
        (1000 * 60),
    );

    // Calculate break time if any
    let breakMinutes = 0;
    if (activeRecord.breakStartTime && activeRecord.breakEndTime) {
      breakMinutes = Math.floor(
        (activeRecord.breakEndTime.getTime() -
          activeRecord.breakStartTime.getTime()) /
          (1000 * 60),
      );
    }

    const [updatedRecord] = await db
      .update(attendanceRecords)
      .set({
        clockOutTime,
        status: "clocked_out",
        totalWorkingMinutes: workingMinutes - breakMinutes,
        totalBreakMinutes: breakMinutes,
        notes: notes
          ? `${activeRecord.notes ?? ""}\nClock Out: ${notes}`.trim()
          : activeRecord.notes,
        updatedAt: new Date(),
      })
      .where(eq(attendanceRecords.id, activeRecord.id))
      .returning();

    return updatedRecord;
  }

  static async startBreak(session: Session) {
    const employee = await this.validateEmployee(session.user.id);

    const activeRecord = await db.query.attendanceRecords.findFirst({
      where: and(
        eq(attendanceRecords.employeeId, employee.id),
        eq(attendanceRecords.status, "clocked_in"),
      ),
    });

    if (!activeRecord) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No active clock-in record found. Please clock in first.",
      });
    }

    if (activeRecord.breakStartTime && !activeRecord.breakEndTime) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Break already started. Please end break first.",
      });
    }

    const [updatedRecord] = await db
      .update(attendanceRecords)
      .set({
        breakStartTime: new Date(),
        status: "break_start",
        updatedAt: new Date(),
      })
      .where(eq(attendanceRecords.id, activeRecord.id))
      .returning();

    return updatedRecord;
  }

  static async endBreak(session: Session) {
    const employee = await this.validateEmployee(session.user.id);

    const activeRecord = await db.query.attendanceRecords.findFirst({
      where: and(
        eq(attendanceRecords.employeeId, employee.id),
        eq(attendanceRecords.status, "break_start"),
      ),
    });

    if (!activeRecord?.breakStartTime) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No active break found. Please start break first.",
      });
    }

    const [updatedRecord] = await db
      .update(attendanceRecords)
      .set({
        breakEndTime: new Date(),
        status: "clocked_in",
        updatedAt: new Date(),
      })
      .where(eq(attendanceRecords.id, activeRecord.id))
      .returning();

    return updatedRecord;
  }

  static async getCurrentStatus(session: Session) {
    const employee = await this.validateEmployee(session.user.id);

    const activeRecord = await db.query.attendanceRecords.findFirst({
      where: and(
        eq(attendanceRecords.employeeId, employee.id),
        isNull(attendanceRecords.clockOutTime),
      ),
      with: {
        employee: {
          with: {
            user: true,
          },
        },
      },
      orderBy: [desc(attendanceRecords.clockInTime)],
    });

    return {
      employee,
      activeRecord,
      status: activeRecord?.status ?? "clocked_out",
    };
  }

  static async getAttendanceHistory(
    session: Session,
    options: {
      employeeId?: string;
      startDate?: Date;
      endDate?: Date;
      page?: number;
      limit?: number;
    } = {},
  ) {
    const { employeeId, startDate, endDate, page, limit } = options;

    const currentEmployee = await this.validateEmployee(session.user.id);
    const isHRAdmin = ["hr", "founder"].includes(currentEmployee.designation);

    const whereConditions = [];

    // If not HR/Admin, can only see own records
    if (!isHRAdmin) {
      whereConditions.push(
        eq(attendanceRecords.employeeId, currentEmployee.id),
      );
    } else if (employeeId) {
      whereConditions.push(eq(attendanceRecords.employeeId, employeeId));
    }

    // Date filters - dates are already normalized on frontend
    if (startDate) {
      whereConditions.push(
        gte(attendanceRecords.clockInTime, startDate),
      );
    }

    if (endDate) {
      whereConditions.push(
        lte(attendanceRecords.clockInTime, endDate),
      );
    }

    // Build base query options
    const baseOptions = {
      where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
      with: {
        employee: {
          with: {
            user: true,
          },
        },
      },
      orderBy: [desc(attendanceRecords.clockInTime)],
    };

    // Add pagination if specified
    const queryOptions = page !== undefined && limit !== undefined 
      ? {
          ...baseOptions,
          limit,
          offset: (page - 1) * limit,
        }
      : baseOptions;

    const records = await db.query.attendanceRecords.findMany(queryOptions);

    // If pagination is requested, also get count
    if (page !== undefined && limit !== undefined) {
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(attendanceRecords)
        .where(
          whereConditions.length > 0 ? and(...whereConditions) : undefined,
        );

      const totalCount = countResult[0]?.count ?? 0;

      return {
        data: records,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      };
    }

    // Return all data without pagination
    return {
      data: records,
    };
  }

  static async getAttendanceSummary(
    session: Session,
    employeeId?: string,
    month?: number,
    year?: number,
  ) {
    const currentEmployee = await this.validateEmployee(session.user.id);
    const isHRAdmin = ["hr", "founder"].includes(currentEmployee.designation);

    let targetEmployeeId = employeeId;
    if (!isHRAdmin && employeeId && employeeId !== currentEmployee.id) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You can only view your own attendance summary",
      });
    }

    targetEmployeeId ??= currentEmployee.id;

    const currentDate = new Date();
    const targetMonth = month ?? currentDate.getMonth();
    const targetYear = year ?? currentDate.getFullYear();

    const startOfMonth = new Date(targetYear, targetMonth, 1);
    const endOfMonth = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);

    const records = await db.query.attendanceRecords.findMany({
      where: and(
        eq(attendanceRecords.employeeId, targetEmployeeId),
        gte(attendanceRecords.clockInTime, startOfMonth),
        lte(attendanceRecords.clockInTime, endOfMonth),
        isNotNull(attendanceRecords.clockOutTime),
      ),
    });

    const totalWorkingMinutes = records.reduce(
      (sum, record) => sum + (record.totalWorkingMinutes ?? 0),
      0,
    );
    const totalBreakMinutes = records.reduce(
      (sum, record) => sum + (record.totalBreakMinutes ?? 0),
      0,
    );
    const totalDaysWorked = records.length;

    return {
      month: targetMonth,
      year: targetYear,
      totalDaysWorked,
      totalWorkingHours: Math.floor(totalWorkingMinutes / 60),
      totalWorkingMinutes: totalWorkingMinutes % 60,
      totalBreakHours: Math.floor(totalBreakMinutes / 60),
      totalBreakMinutes: totalBreakMinutes % 60,
      averageWorkingHours:
        totalDaysWorked > 0 ? totalWorkingMinutes / totalDaysWorked / 60 : 0,
      records: records.slice(0, 5), // Last 5 records for quick view
    };
  }
}
