import { db } from "@/server/db";
import { employees, invitations, members, users } from "@/server/db/schema";
import { and, eq, ilike, desc, asc, sql, or } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { auth } from "@/server/auth";
import { headers } from "next/headers";
import type { PaginationOptions } from "@/types/table";
import type { EmployeeStatus } from "@/server/db/consts";
import type {
  EmployeeListParams,
  EmployeeWithUser,
} from "../types/employee.types";

export class EmployeeService {
  static async createEmployee(data: {
    name: string;
    designation: string;
    organizationId: string;
    invitationId?: string;
    userId?: string;
    memberId?: string;
    status: EmployeeStatus;
  }) {
    try {
      const employee = await db
        .insert(employees)
        .values({
          // name: data.name,
          designation: data.designation,
          organizationId: data.organizationId,
          invitationId: data.invitationId ?? null,
          userId: data.userId ?? null,
          memberId: data.memberId ?? null,
          status: data.status,
        })
        .returning();

      return employee[0];
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create employee",
      });
    }
  }

  static async updateEmployee(
    employeeId: string,
    organizationId: string,
    data: {
      name?: string;
      designation?: string;
      userId?: string;
      memberId?: string;
    },
  ) {
    try {
      const employee = await db
        .update(employees)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(employees.id, employeeId),
            eq(employees.organizationId, organizationId),
          ),
        )
        .returning();

      if (!employee[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Employee not found",
        });
      }

      return employee[0];
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to update employee",
      });
    }
  }

  static async deleteEmployee(employeeId: string, organizationId: string) {
    try {
      const [deletedEmployee] = await db
        .update(employees)
        .set({
          deletedAt: new Date(),
        })
        .where(
          and(
            eq(employees.id, employeeId),
            eq(employees.organizationId, organizationId),
          ),
        )
        .returning();

      return deletedEmployee;
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to delete employee",
      });
    }
  }

  static async getEmployeeById(
    employeeId: string,
    organizationId: string,
  ): Promise<EmployeeWithUser> {
    try {
      const result = await db
        .select({
          id: employees.id,
          // name: employees.name,
          designation: employees.designation,
          createdAt: employees.createdAt,
          updatedAt: employees.updatedAt,
          organizationId: employees.organizationId,
          userId: employees.userId,
          memberId: employees.memberId,
          invitationId: employees.invitationId,
          userName: users.name,
          userEmail: users.email,
          userImage: users.image,
          userUserId: users.id,
          status: employees.status,
        })
        .from(employees)
        .leftJoin(users, eq(employees.userId, users.id))
        .leftJoin(invitations, eq(employees.invitationId, invitations.id))
        .where(
          and(
            eq(employees.id, employeeId),
            eq(employees.organizationId, organizationId),
          ),
        );

      const employee = result[0];
      if (!employee) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Employee not found",
        });
      }

      return {
        id: employee.id,
        designation: employee.designation,
        createdAt: employee.createdAt,
        updatedAt: employee.updatedAt,
        organizationId: employee.organizationId,
        userId: employee.userId,
        memberId: employee.memberId,
        invitationId: employee.invitationId,
        status: employee.status,
        user: employee.userUserId
          ? {
              id: employee.userUserId,
              name: employee.userName!,
              email: employee.userEmail!,
              image: employee.userImage,
            }
          : null,
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch employee",
      });
    }
  }

  static async listEmployees(params: EmployeeListParams) {
    try {
      const {
        organizationId,
        limit,
        offset,
        searchQuery,
        designation,
        status,
        sortBy,
        sortDirection,
      } = params;

      // Build filters
      const filters = [
        // eq(employees.organizationId, organizationId),
        eq(employees.status, "active"),
        sql`${employees.deletedAt} IS NULL`,
      ];

      if (organizationId) {
        filters.push(eq(employees.organizationId, organizationId));
      }

      if (searchQuery) {
        filters.push(
          or(
            // ilike(employees.name, `%${searchQuery}%`),
            ilike(employees.designation, `%${searchQuery}%`),
            ilike(users.email, `%${searchQuery}%`),
          )!,
        );
      }

      if (designation) {
        filters.push(ilike(employees.designation, `%${designation}%`));
      }

      if (status === "active") {
        filters.push(sql`${employees.userId} IS NOT NULL`);
      } else if (status === "invited") {
        filters.push(sql`${employees.userId} IS NULL`);
      }

      // Get total count
      const totalCountResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(employees)
        .leftJoin(users, eq(employees.userId, users.id))
        .where(and(...filters));

      const totalCount = Number(totalCountResult[0]?.count) || 0;
      const totalPages = Math.ceil(totalCount / limit);

      // Build sort order
      let orderBy;
      const direction = sortDirection === "desc" ? desc : asc;

      switch (sortBy) {
        // case "name":
        //   orderBy = direction(employees.name);
        // break;
        case "designation":
          orderBy = direction(employees.designation);
          break;
        case "email":
          orderBy = direction(users.email);
          break;
        default:
          orderBy = direction(employees.createdAt);
      }

      // Get employees with user data
      const results = await db
        .select({
          id: employees.id,
          designation: employees.designation,
          createdAt: employees.createdAt,
          updatedAt: employees.updatedAt,
          organizationId: employees.organizationId,
          userId: employees.userId,
          memberId: employees.memberId,
          invitationId: employees.invitationId,
          userName: users.name,
          userEmail: users.email,
          userImage: users.image,
          userUserId: users.id,
          status: employees.status,
        })
        .from(employees)
        .leftJoin(users, eq(employees.userId, users.id))
        .where(and(...filters))
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset);

      const employeesWithUser: EmployeeWithUser[] = results.map((employee) => ({
        id: employee.id,
        designation: employee.designation,
        createdAt: employee.createdAt,
        updatedAt: employee.updatedAt,
        organizationId: employee.organizationId,
        userId: employee.userId,
        memberId: employee.memberId,
        invitationId: employee.invitationId,
        status: employee.status,
        user: employee.userUserId
          ? {
              id: employee.userUserId,
              name: employee.userName!,
              email: employee.userEmail!,
              image: employee.userImage,
            }
          : null,
      }));

      return {
        employees: employeesWithUser,
        pagination: {
          page: Math.floor(offset / limit) + 1,
          limit,
          totalCount,
          totalPages,
          hasNext: offset + limit < totalCount,
          hasPrev: offset > 0,
        },
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch employees",
      });
    }
  }

  static async getEmployeeByUserId(userId: string) {
    try {
      const employee = await db.query.employees.findFirst({
        where: eq(employees.userId, userId),
      });

      return employee;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch employee",
      });
    }
  }

  static async cancelEmployeeInvitation(
    employeeId: string,
    organizationId: string,
  ) {
    try {
      const employee = await db.query.employees.findFirst({
        where: and(
          eq(employees.id, employeeId),
          eq(employees.organizationId, organizationId),
        ),
      });

      if (!employee) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Employee not found",
        });
      }

      if (!employee.invitationId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Employee has no pending invitation",
        });
      }

      const result = await auth.api.cancelInvitation({
        headers: await headers(),
        body: {
          invitationId: employee.invitationId,
        },
      });

      if (!result) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to cancel invitation",
        });
      }

      // Delete the employee record since invitation was cancelled
      await db.delete(employees).where(eq(employees.id, employeeId));

      return { success: true };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to cancel invitation",
      });
    }
  }

  static async updateEmployeeAfterInvitationAccepted(
    userId: string,
    memberId: string,
    organizationId: string,
  ) {
    try {
      const employee = await db
        .update(employees)
        .set({
          userId,
          memberId,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(employees.organizationId, organizationId),
            sql`${employees.userId} IS NULL`,
            sql`${employees.invitationId} IS NOT NULL`,
          ),
        )
        .returning();

      return employee[0];
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to update employee after invitation acceptance",
      });
    }
  }

  static async getCurrentEmployee({
    userId,
    organizationId,
  }: {
    userId: string;
    organizationId: string;
  }) {
    const [employee] = await db
      .select({
        id: employees.id,
        designation: employees.designation,
        createdAt: employees.createdAt,
        updatedAt: employees.updatedAt,
        organizationId: employees.organizationId,
        userId: employees.userId,
        memberId: employees.memberId,
        invitationId: employees.invitationId,
        status: employees.status,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          image: users.image,
        },
      })
      .from(employees)
      .leftJoin(users, eq(employees.userId, users.id))
      .where(
        and(
          eq(employees.userId, userId),
          eq(employees.organizationId, organizationId),
        ),
      );

    if (!employee) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Employee not found",
      });
    }
    return employee;
  }
}
