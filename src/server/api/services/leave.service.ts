import { TRPCError } from "@trpc/server";
import { and, eq, gte, lte, desc, asc, sql, inArray } from "drizzle-orm";
import { db } from "@/server/db";
import { employees, members } from "@/server/db/schema";
import {
  leaveRequests,
  leaveBalances,
  leavePolicies,
  type leaveTypeEnum,
} from "@/server/db/leaves";
import type {
  CreateLeaveRequest,
  ApproveRejectLeave,
  LeaveRequestList,
  CreateLeavePolicy,
  UpdateLeavePolicy,
} from "@/modules/leaves/schemas";

type Session = {
  user: { id: string };
  session: { activeOrganizationId?: string | null | undefined };
};

type LeaveType = (typeof leaveTypeEnum.enumValues)[number];

export class LeaveService {
  static async validateEmployee(userId: string) {
    const employee = await db.query.employees.findFirst({
      where: eq(employees.userId, userId),
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
    const activeOrgId = session.session.activeOrganizationId;
    if (!activeOrgId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No active organization found",
      });
    }

    const member = await db.query.members.findFirst({
      where: and(
        eq(members.userId, session.user.id),
        eq(members.organizationId, activeOrgId),
      ),
    });

    if (!member || (member.role !== "admin" && member.role !== "owner")) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only HR and Admin can perform this action",
      });
    }

    return { member, activeOrgId };
  }

  static async isHRAdmin(session: Session) {
    try {
      await this.validateHRAccess(session);
      return true;
    } catch {
      return false;
    }
  }

  static calculateTotalDays(startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays =
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    if (totalDays <= 0) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "End date must be after start date",
      });
    }

    return totalDays;
  }

  static async checkLeaveBalance(
    employeeId: string,
    leaveType: LeaveType,
    totalDays: number,
  ) {
    if (leaveType === "emergency") return;

    const currentYear = new Date().getFullYear();
    const balance = await db.query.leaveBalances.findFirst({
      where: and(
        eq(leaveBalances.employeeId, employeeId),
        eq(leaveBalances.leaveType, leaveType),
        eq(leaveBalances.year, currentYear),
      ),
    });

    if (!balance || balance.remaining < totalDays) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Insufficient leave balance for ${leaveType} leave`,
      });
    }
  }

  static async createLeaveRequest(input: CreateLeaveRequest, session: Session) {
    const employee = await this.validateEmployee(session.user.id);
    const totalDays = this.calculateTotalDays(input.startDate, input.endDate);

    await this.checkLeaveBalance(
      employee.id,
      input.leaveType as LeaveType,
      totalDays,
    );

    const [leaveRequest] = await db
      .insert(leaveRequests)
      .values({
        employeeId: employee.id,
        leaveType: input.leaveType,
        startDate: input.startDate,
        endDate: input.endDate,
        totalDays,
        reason: input.reason,
        status: "pending",
      })
      .returning();

    return leaveRequest;
  }

  static async getLeaveRequests(input: LeaveRequestList, session: Session) {
    const {
      page = 1,
      limit = 10,
      employeeId,
      status,
      leaveType,
      startDate,
      endDate,
    } = input;
    const offset = (page - 1) * limit;
    const whereConditions = [];

    const currentEmployee = await db.query.employees.findFirst({
      where: eq(employees.userId, session.user.id),
    });

    const isHRAdmin = await this.isHRAdmin(session);

    if (currentEmployee && !isHRAdmin) {
      whereConditions.push(eq(leaveRequests.employeeId, currentEmployee.id));
    }

    if (employeeId) {
      whereConditions.push(eq(leaveRequests.employeeId, employeeId));
    }

    if (status) {
      whereConditions.push(eq(leaveRequests.status, status));
    }

    if (leaveType) {
      whereConditions.push(eq(leaveRequests.leaveType, leaveType));
    }

    if (startDate) {
      whereConditions.push(gte(leaveRequests.startDate, startDate));
    }

    if (endDate) {
      whereConditions.push(lte(leaveRequests.endDate, endDate));
    }

    const requests = await db.query.leaveRequests.findMany({
      where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
      with: {
        employee: {
          with: {
            user: true,
          },
        },
        approver: {
          with: {
            user: true,
          },
        },
      },
      orderBy: [desc(leaveRequests.createdAt)],
      limit,
      offset,
    });

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(leaveRequests)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    const totalCount = countResult[0]?.count ?? 0;

    return {
      data: requests,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  static async getLeaveRequestById(id: string, session: Session) {
    const request = await db.query.leaveRequests.findFirst({
      where: eq(leaveRequests.id, id),
      with: {
        employee: {
          with: {
            user: true,
          },
        },
        approver: {
          with: {
            user: true,
          },
        },
      },
    });

    if (!request) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Leave request not found",
      });
    }

    const currentEmployee = await db.query.employees.findFirst({
      where: eq(employees.userId, session.user.id),
    });

    const isHRAdmin = await this.isHRAdmin(session);

    if (
      !isHRAdmin &&
      currentEmployee &&
      request.employeeId !== currentEmployee.id
    ) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You can only view your own leave requests",
      });
    }

    return request;
  }

  static async updateLeaveStatus(input: ApproveRejectLeave, session: Session) {
    await this.validateHRAccess(session);
    const approverEmployee = await this.validateEmployee(session.user.id);

    const request = await db.query.leaveRequests.findFirst({
      where: eq(leaveRequests.id, input.id),
    });

    if (!request) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Leave request not found",
      });
    }

    if (request.status !== "pending") {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Can only update pending requests",
      });
    }

    const [updatedRequest] = await db
      .update(leaveRequests)
      .set({
        status: input.status,
        approvedBy: approverEmployee.id,
        approvedAt:
          input.status === "approved"
            ? new Date().toISOString().split("T")[0]
            : null,
        rejectionReason: input.rejectionReason,
        updatedAt: new Date(),
      })
      .where(eq(leaveRequests.id, input.id))
      .returning();

    if (input.status === "approved") {
      await this.deductLeaveBalance(
        request.employeeId,
        request.leaveType,
        request.totalDays,
      );
    }

    return updatedRequest;
  }

  private static async deductLeaveBalance(
    employeeId: string,
    leaveType: string,
    totalDays: number,
  ) {
    const currentYear = new Date().getFullYear();
    await db
      .update(leaveBalances)
      .set({
        used: sql`${leaveBalances.used} + ${totalDays}`,
        remaining: sql`${leaveBalances.remaining} - ${totalDays}`,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(leaveBalances.employeeId, employeeId),
          eq(leaveBalances.leaveType, leaveType as LeaveType),
          eq(leaveBalances.year, currentYear),
        ),
      );
  }

  static async getLeaveBalances(
    employeeId: string | undefined,
    session: Session,
  ) {
    const year = new Date().getFullYear();
    let targetEmployeeId: string;

    if (!employeeId) {
      const currentEmployee = await this.validateEmployee(session.user.id);
      targetEmployeeId = currentEmployee.id;
    } else {
      targetEmployeeId = employeeId;
    }

    const currentEmployee = await db.query.employees.findFirst({
      where: eq(employees.userId, session.user.id),
    });

    const isHRAdmin = await this.isHRAdmin(session);

    if (
      !isHRAdmin &&
      currentEmployee &&
      targetEmployeeId !== currentEmployee.id
    ) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You can only view your own leave balances",
      });
    }

    // Check if employee has leave balances for the current year
    const existingBalances = await db.query.leaveBalances.findMany({
      where: and(
        eq(leaveBalances.employeeId, targetEmployeeId),
        eq(leaveBalances.year, year),
      ),
      orderBy: [asc(leaveBalances.leaveType)],
    });

    // If no balances exist, initialize them based on organization's leave policies
    if (existingBalances.length === 0) {
      await this.initializeLeaveBalancesForEmployee(targetEmployeeId, year);

      // Fetch the newly created balances
      return db.query.leaveBalances.findMany({
        where: and(
          eq(leaveBalances.employeeId, targetEmployeeId),
          eq(leaveBalances.year, year),
        ),
        orderBy: [asc(leaveBalances.leaveType)],
      });
    }

    return existingBalances;
  }

  static async initializeLeaveBalancesForEmployee(
    employeeId: string,
    year: number,
  ) {
    // Get the employee's organization
    const employee = await db.query.employees.findFirst({
      where: eq(employees.id, employeeId),
    });

    if (!employee) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Employee not found",
      });
    }

    // Get organization's leave policies
    const policies = await db.query.leavePolicies.findMany({
      where: and(
        eq(leavePolicies.organizationId, employee.organizationId),
        eq(leavePolicies.isActive, true),
      ),
    });

    // Create leave balance records for each policy
    const balanceRecords = policies.map((policy) => ({
      employeeId: employeeId,
      leaveType: policy.leaveType,
      totalAllowed: policy.defaultAllowance,
      used: 0,
      remaining: policy.defaultAllowance,
      year: year,
    }));

    if (balanceRecords.length > 0) {
      await db.insert(leaveBalances).values(balanceRecords);
    }
  }

  static async adjustLeaveBalance(
    employeeId: string,
    leaveType: string,
    adjustment: number,
    reason: string,
    session: Session,
  ) {
    await this.validateHRAccess(session);
    const currentYear = new Date().getFullYear();

    const balance = await db.query.leaveBalances.findFirst({
      where: and(
        eq(leaveBalances.employeeId, employeeId),
        eq(leaveBalances.leaveType, leaveType as LeaveType),
        eq(leaveBalances.year, currentYear),
      ),
    });

    if (!balance) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Leave balance not found",
      });
    }

    const newTotalAllowed = balance.totalAllowed + adjustment;
    const newRemaining = balance.remaining + adjustment;

    if (newTotalAllowed < 0 || newRemaining < 0) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Adjustment would result in negative balance",
      });
    }

    const [updatedBalance] = await db
      .update(leaveBalances)
      .set({
        totalAllowed: newTotalAllowed,
        remaining: newRemaining,
        updatedAt: new Date(),
      })
      .where(eq(leaveBalances.id, balance.id))
      .returning();

    return updatedBalance;
  }

  static async getLeavePolicies(session: Session) {
    // const { activeOrgId } = await this.validateHRAccess(session);
    const activeOrgId = session.session.activeOrganizationId;

    if (!activeOrgId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No active organization found",
      });
    }

    return db.query.leavePolicies.findMany({
      where: eq(leavePolicies.organizationId, activeOrgId),
      orderBy: [asc(leavePolicies.leaveType)],
    });
  }

  static async createLeavePolicy(input: CreateLeavePolicy, session: Session) {
    const { activeOrgId } = await this.validateHRAccess(session);

    const existing = await db.query.leavePolicies.findFirst({
      where: and(
        eq(leavePolicies.organizationId, activeOrgId),
        eq(leavePolicies.leaveType, input.leaveType),
      ),
    });

    if (existing) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Leave policy already exists for this leave type",
      });
    }

    const [newPolicy] = await db
      .insert(leavePolicies)
      .values({
        organizationId: activeOrgId,
        leaveType: input.leaveType,
        defaultAllowance: input.defaultAllowance,
        carryForward: input.carryForward ?? false,
        maxCarryForward: input.maxCarryForward ?? 0,
        isActive: true,
      })
      .returning();

    // Automatically initialize leave balances for all existing employees
    // when a new policy is created
    const currentYear = new Date().getFullYear();
    const activeEmployees = await db.query.employees.findMany({
      where: and(
        eq(employees.organizationId, activeOrgId),
        // Include both active and invited employees
        inArray(employees.status, ["active", "invited"]),
      ),
    });

    // Get existing balances for all employees at once (more efficient)
    const existingBalances = await db.query.leaveBalances.findMany({
      where: and(
        eq(leaveBalances.leaveType, input.leaveType),
        eq(leaveBalances.year, currentYear),
        inArray(
          leaveBalances.employeeId,
          activeEmployees.map((emp) => emp.id),
        ),
      ),
    });

    const existingEmployeeIds = existingBalances.map((b) => b.employeeId);

    // Create leave balance records for employees who don't already have this leave type
    const balancesToCreate = activeEmployees
      .filter((employee) => !existingEmployeeIds.includes(employee.id))
      .map((employee) => ({
        employeeId: employee.id,
        leaveType: input.leaveType,
        totalAllowed: input.defaultAllowance,
        used: 0,
        remaining: input.defaultAllowance,
        year: currentYear,
      }));

    if (balancesToCreate.length > 0) {
      await db.insert(leaveBalances).values(balancesToCreate);
    }

    return newPolicy;
  }

  static async updateLeavePolicy(input: UpdateLeavePolicy, session: Session) {
    const { activeOrgId } = await this.validateHRAccess(session);
    const { id, ...updateData } = input;

    const currentPolicy = await db.query.leavePolicies.findFirst({
      where: and(
        eq(leavePolicies.id, id),
        eq(leavePolicies.organizationId, activeOrgId),
      ),
    });

    if (!currentPolicy) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Leave policy not found",
      });
    }

    const [updatedPolicy] = await db
      .update(leavePolicies)
      .set(updateData)
      .where(
        and(
          eq(leavePolicies.id, id),
          eq(leavePolicies.organizationId, activeOrgId),
        ),
      )
      .returning();

    if (!updatedPolicy) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Leave policy not found",
      });
    }

    // If defaultAllowance was updated, update existing employee balances
    if (
      updateData.defaultAllowance !== undefined &&
      updateData.defaultAllowance !== currentPolicy.defaultAllowance
    ) {
      await this.updateEmployeeBalancesForPolicyChange(
        activeOrgId,
        updatedPolicy.leaveType,
        currentPolicy.defaultAllowance,
        updatedPolicy.defaultAllowance,
      );
    }

    return updatedPolicy;
  }

  static async deleteLeavePolicy(id: string, session: Session) {
    const { activeOrgId } = await this.validateHRAccess(session);

    const deletedPolicy = await db
      .delete(leavePolicies)
      .where(
        and(
          eq(leavePolicies.id, id),
          eq(leavePolicies.organizationId, activeOrgId),
        ),
      )
      .returning();

    if (deletedPolicy.length === 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Leave policy not found",
      });
    }

    return deletedPolicy[0];
  }

  static async initializeEmployeeLeaveBalances(
    employeeId: string,
    organizationId: string,
    year?: number,
  ) {
    const currentYear = year ?? new Date().getFullYear();

    // Get all active leave policies for the organization
    const policies = await db.query.leavePolicies.findMany({
      where: and(
        eq(leavePolicies.organizationId, organizationId),
        eq(leavePolicies.isActive, true),
      ),
    });

    // Check if balances already exist for this employee and year
    const existingBalances = await db.query.leaveBalances.findMany({
      where: and(
        eq(leaveBalances.employeeId, employeeId),
        eq(leaveBalances.year, currentYear),
      ),
    });

    const existingLeaveTypes = existingBalances.map((b) => b.leaveType);

    // Create balance records for each policy that doesn't already exist
    const newBalances = [];
    for (const policy of policies) {
      if (!existingLeaveTypes.includes(policy.leaveType)) {
        newBalances.push({
          employeeId,
          leaveType: policy.leaveType,
          totalAllowed: policy.defaultAllowance,
          used: 0,
          remaining: policy.defaultAllowance,
          year: currentYear,
        });
      }
    }

    if (newBalances.length > 0) {
      await db.insert(leaveBalances).values(newBalances);
    }

    return newBalances.length;
  }

  static async initializeAllEmployeesLeaveBalances(
    organizationId: string,
    year?: number,
  ) {
    const currentYear = year ?? new Date().getFullYear();

    const activeEmployees = await db.query.employees.findMany({
      where: and(
        eq(employees.organizationId, organizationId),
        // Include both active and invited employees
        inArray(employees.status, ["active", "invited"]),
      ),
    });

    let totalInitialized = 0;
    for (const employee of activeEmployees) {
      const initialized = await this.initializeEmployeeLeaveBalances(
        employee.id,
        organizationId,
        currentYear,
      );
      totalInitialized += initialized;
    }

    return {
      employeesProcessed: activeEmployees.length,
      balancesInitialized: totalInitialized,
    };
  }

  static async updateEmployeeBalancesForPolicyChange(
    organizationId: string,
    leaveType:
      | "annual"
      | "sick"
      | "casual"
      | "maternity"
      | "paternity"
      | "emergency",
    oldAllowance: number,
    newAllowance: number,
  ) {
    const currentYear = new Date().getFullYear();
    const allowanceDifference = newAllowance - oldAllowance;

    // Get all active employees in the organization
    const activeEmployees = await db.query.employees.findMany({
      where: and(
        eq(employees.organizationId, organizationId),
        // Include both active and invited employees
        inArray(employees.status, ["active", "invited"]),
      ),
    });

    // Update existing balances for this leave type and current year
    const existingBalances = await db.query.leaveBalances.findMany({
      where: and(
        eq(leaveBalances.year, currentYear),
        eq(leaveBalances.leaveType, leaveType),
        inArray(
          leaveBalances.employeeId,
          activeEmployees.map((emp) => emp.id),
        ),
      ),
    });

    // Update each existing balance
    for (const balance of existingBalances) {
      const newTotalAllowed = balance.totalAllowed + allowanceDifference;
      const newRemaining = Math.max(0, balance.remaining + allowanceDifference);

      await db
        .update(leaveBalances)
        .set({
          totalAllowed: newTotalAllowed,
          remaining: newRemaining,
        })
        .where(eq(leaveBalances.id, balance.id));
    }

    // For employees who don't have a balance record yet, create one with the new allowance
    const existingEmployeeIds = existingBalances.map((b) => b.employeeId);
    const employeesWithoutBalance = activeEmployees.filter(
      (emp) => !existingEmployeeIds.includes(emp.id),
    );

    if (employeesWithoutBalance.length > 0) {
      const newBalances = employeesWithoutBalance.map((employee) => ({
        employeeId: employee.id,
        leaveType: leaveType as (typeof leaveTypeEnum.enumValues)[number],
        totalAllowed: newAllowance,
        used: 0,
        remaining: newAllowance,
        year: currentYear,
      }));

      await db.insert(leaveBalances).values(newBalances);
    }

    return {
      updatedBalances: existingBalances.length,
      newBalances: employeesWithoutBalance.length,
      allowanceDifference,
    };
  }

  /**
   * Utility method to ensure all employees in an organization have leave balances
   * for all active leave policies. This can be used to fix any gaps.
   */
  static async syncAllEmployeeLeaveBalances(
    organizationId: string,
    session: Session,
  ) {
    const { activeOrgId } = await this.validateHRAccess(session);

    if (activeOrgId !== organizationId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Invalid organization access",
      });
    }

    const result =
      await this.initializeAllEmployeesLeaveBalances(organizationId);

    return {
      message: `Successfully synced leave balances for ${result.employeesProcessed} employees`,
      ...result,
    };
  }
}
