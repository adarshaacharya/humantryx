import { TRPCError } from "@trpc/server";
import { and, eq, gte, lte, desc } from "drizzle-orm";
import { db } from "@/server/db";
import {
  employees,
  payrollRecords,
  employeeSalarySettings,
  users,
} from "@/server/db/schema";

type Session = {
  user: { id: string };
  session: { activeOrganizationId?: string | null | undefined };
};

export class PayrollService {
  static async validateHRAccess(session: Session) {
    const employee = await db.query.employees.findFirst({
      where: eq(employees.userId, session.user.id),
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

    if (!["hr", "founder"].includes(employee.designation)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only HR and Admin can access payroll management",
      });
    }

    return employee;
  }

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

  // Set up salary settings for an employee
  static async setSalarySettings(
    session: Session,
    input: {
      employeeId: string;
      baseSalary: number;
      taxPercentage: number;
    },
  ) {
    const hrEmployee = await this.validateHRAccess(session);

    // Check if settings already exist
    const existingSettings = await db.query.employeeSalarySettings.findFirst({
      where: eq(employeeSalarySettings.employeeId, input.employeeId),
    });

    if (existingSettings) {
      // Update existing settings
      const [updated] = await db
        .update(employeeSalarySettings)
        .set({
          baseSalary: input.baseSalary.toString(),
          taxPercentage: input.taxPercentage.toString(),
          updatedBy: hrEmployee.id,
          updatedAt: new Date(),
        })
        .where(eq(employeeSalarySettings.employeeId, input.employeeId))
        .returning();

      return updated;
    } else {
      // Create new settings
      const [created] = await db
        .insert(employeeSalarySettings)
        .values({
          employeeId: input.employeeId,
          baseSalary: input.baseSalary.toString(),
          taxPercentage: input.taxPercentage.toString(),
          updatedBy: hrEmployee.id,
        })
        .returning();

      return created;
    }
  }

  // Get salary settings for an employee
  static async getSalarySettings(session: Session, employeeId?: string) {
    let targetEmployeeId = employeeId;

    if (!employeeId) {
      const employee = await this.validateEmployee(session.user.id);
      targetEmployeeId = employee.id;
    }

    const settings = await db.query.employeeSalarySettings.findFirst({
      where: eq(employeeSalarySettings.employeeId, targetEmployeeId!),
      with: {
        employee: {
          with: {
            user: true,
          },
        },
      },
    });

    return settings;
  }

  // Generate payroll for a specific month
  static async generatePayroll(
    session: Session,
    input: {
      employeeId: string;
      payrollMonth: string; // "2025-06"
      bonuses?: number;
      unpaidLeaveDays?: number;
      notes?: string;
    },
  ) {
    const hrEmployee = await this.validateHRAccess(session);

    // Get employee salary settings
    const salarySettings = await db.query.employeeSalarySettings.findFirst({
      where: eq(employeeSalarySettings.employeeId, input.employeeId),
    });

    if (!salarySettings) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message:
          "Salary settings not found for this employee. Please set up salary first.",
      });
    }

    // Check if payroll already exists for this month
    const existingPayroll = await db.query.payrollRecords.findFirst({
      where: and(
        eq(payrollRecords.employeeId, input.employeeId),
        eq(payrollRecords.payrollMonth, input.payrollMonth),
      ),
    });

    if (existingPayroll) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Payroll already exists for this employee and month",
      });
    }

    // Calculate payroll
    const baseSalary = parseFloat(salarySettings.baseSalary);
    const bonuses = input.bonuses || 0;
    const unpaidLeaveDays = input.unpaidLeaveDays || 0;
    const taxPercentage = parseFloat(salarySettings.taxPercentage ?? "0");

    // Calculate leave deduction (assuming 30 working days per month)
    const perDayRate = baseSalary / 30;
    const leaveDeduction = unpaidLeaveDays * perDayRate;

    // Calculate tax deduction
    const grossPay = baseSalary + bonuses;
    const taxDeduction = (grossPay * taxPercentage) / 100;

    // Calculate net pay
    const totalDeductions = leaveDeduction + taxDeduction;
    const netPay = grossPay - totalDeductions;

    // Create payroll record
    const [payroll] = await db
      .insert(payrollRecords)
      .values({
        employeeId: input.employeeId,
        payrollMonth: input.payrollMonth,
        baseSalary: baseSalary.toString(),
        bonuses: bonuses.toString(),
        unpaidLeaveDays,
        perDayRate: perDayRate.toString(),
        leaveDeduction: leaveDeduction.toString(),
        taxPercentage: taxPercentage.toString(),
        taxDeduction: taxDeduction.toString(),
        grossPay: grossPay.toString(),
        totalDeductions: totalDeductions.toString(),
        netPay: netPay.toString(),
        generatedBy: hrEmployee.id,
        notes: input.notes,
      })
      .returning();

    return payroll;
  }

  // Get payroll records
  static async getPayrollRecords(
    session: Session,
    options: {
      employeeId?: string;
      payrollMonth?: string;
      year?: number;
    } = {},
  ) {
    const currentEmployee = await this.validateEmployee(session.user.id);
    const isHRAdmin = ["hr", "founder"].includes(currentEmployee.designation);

    const whereConditions = [];

    // If not HR/Admin, can only see own records
    if (!isHRAdmin) {
      whereConditions.push(eq(payrollRecords.employeeId, currentEmployee.id));
    } else if (options.employeeId) {
      whereConditions.push(eq(payrollRecords.employeeId, options.employeeId));
    }

    // Filter by month
    if (options.payrollMonth) {
      whereConditions.push(
        eq(payrollRecords.payrollMonth, options.payrollMonth),
      );
    }

    // Filter by year
    if (options.year) {
      whereConditions.push(
        gte(payrollRecords.payrollMonth, `${options.year}-01`),
        lte(payrollRecords.payrollMonth, `${options.year}-12`),
      );
    }

    const records = await db.query.payrollRecords.findMany({
      where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
      with: {
        employee: {
          with: {
            user: true,
          },
        },
        generatedByEmployee: {
          with: {
            user: true,
          },
        },
      },
      orderBy: [
        desc(payrollRecords.payrollMonth),
        desc(payrollRecords.createdAt),
      ],
    });

    return records;
  }

  // Update payment status
  static async updatePaymentStatus(
    session: Session,
    input: {
      payrollId: string;
      status: "pending" | "paid" | "cancelled";
      paymentDate?: Date;
      paymentReference?: string;
    },
  ) {
    await this.validateHRAccess(session);

    const [updated] = await db
      .update(payrollRecords)
      .set({
        paymentStatus: input.status,
        paymentDate: input.paymentDate,
        paymentReference: input.paymentReference,
        updatedAt: new Date(),
      })
      .where(eq(payrollRecords.id, input.payrollId))
      .returning();

    if (!updated) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Payroll record not found",
      });
    }

    return updated;
  }

  // Get payroll by ID (for salary slip generation)
  static async getPayrollById(session: Session, payrollId: string) {
    const currentEmployee = await this.validateEmployee(session.user.id);
    const isHRAdmin = ["hr", "founder"].includes(currentEmployee.designation);

    const payroll = await db.query.payrollRecords.findFirst({
      where: eq(payrollRecords.id, payrollId),
      with: {
        employee: {
          with: {
            user: true,
          },
        },
        generatedByEmployee: {
          with: {
            user: true,
          },
        },
      },
    });

    if (!payroll) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Payroll record not found",
      });
    }

    // Check permissions
    if (!isHRAdmin && payroll.employeeId !== currentEmployee.id) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You can only view your own payroll records",
      });
    }

    return payroll;
  }

  // List all employees with their salary settings (for HR)
  static async getEmployeesWithSalarySettings(session: Session) {
    await this.validateHRAccess(session);

    if (!session.session.activeOrganizationId) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Organization not found",
      });
    }

    const employeesWithSettings = await db
      .select({
        id: employees.id,
        userId: employees.userId,
        organizationId: employees.organizationId,
        memberId: employees.memberId,
        invitationId: employees.invitationId,
        designation: employees.designation,
        status: employees.status,
        createdAt: employees.createdAt,
        updatedAt: employees.updatedAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          image: users.image,
        },
        salarySettings: {
          id: employeeSalarySettings.id,
          employeeId: employeeSalarySettings.employeeId,
          baseSalary: employeeSalarySettings.baseSalary,
          currency: employeeSalarySettings.currency,
          taxPercentage: employeeSalarySettings.taxPercentage,
          customTaxAmount: employeeSalarySettings.customTaxAmount,
          allowances: employeeSalarySettings.allowances,
          isActive: employeeSalarySettings.isActive,
          updatedBy: employeeSalarySettings.updatedBy,
          createdAt: employeeSalarySettings.createdAt,
          updatedAt: employeeSalarySettings.updatedAt,
        },
      })
      .from(employees)
      .leftJoin(users, eq(employees.userId, users.id))
      .leftJoin(
        employeeSalarySettings,
        eq(employees.id, employeeSalarySettings.employeeId),
      )
      .where(
        and(
          eq(employees.status, "active"),
          eq(employees.organizationId, session.session.activeOrganizationId),
        ),
      );

    return employeesWithSettings;
  }
}
