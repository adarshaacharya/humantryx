import { db } from "@/server/db";
import { employees, invitations, users } from "@/server/db/schema";
import { and, eq, ilike, desc, asc, sql, or } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { auth } from "@/server/auth";
import { headers } from "next/headers";
import { cache, invalidateCache, invalidatePattern } from "@/lib/redis";
import type {
  EmployeeDepartment,
  EmployeeDesignation,
  EmployeeStatus,
} from "@/server/db/consts";
import type {
  EmployeeListParams,
  EmployeeWithUser,
} from "../types/employee.types";

export class EmployeeService {
  private static readonly CACHE_KEYS = {
    // Current employee for specific org - user:123:org:456:employee
    CURRENT_EMPLOYEE: (userId: string, orgId: string) =>
      `hrms:v1:user:${userId}:org:${orgId}:employee`,

    // Employee by ID - org:456:employee:123
    EMPLOYEE_BY_ID: (orgId: string, empId: string) =>
      `hrms:v1:org:${orgId}:employee:${empId}`,

    EMPLOYEE_BY_USER_ID: (userId: string) => `hrms:v1:user:${userId}:employee`,

    EMPLOYEE_LIST: (orgId: string, params: string) =>
      `hrms:v1:org:${orgId}:employees:list:${params}`,

    EMPLOYEE_COUNT: (orgId: string, status?: string) =>
      `hrms:v1:org:${orgId}:employees:count${status ? `:${status}` : ""}`,

    USER_EMPLOYEES: (userId: string) => `hrms:v1:user:${userId}:*`,

    ORG_EMPLOYEES: (orgId: string) => `hrms:v1:org:${orgId}:employees:*`,
  } as const;

  private static readonly CACHE_TTL = {
    CURRENT_EMPLOYEE: 900, // 15 minutes - frequently accessed
    EMPLOYEE_DETAIL: 1800, // 30 minutes - less frequently changed
    EMPLOYEE_LIST: 600, // 10 minutes - list data changes more frequently
    EMPLOYEE_COUNT: 1800, // 30 minutes - counts change less frequently
  } as const;

  static async createEmployee(data: {
    name: string;
    designation: EmployeeDesignation;
    organizationId: string;
    invitationId?: string;
    userId?: string;
    memberId?: string;
    status: EmployeeStatus;
    department: EmployeeDepartment;
  }) {
    try {
      const employee = await db
        .insert(employees)
        .values({
          designation: data.designation,
          department: data.department,
          organizationId: data.organizationId,
          invitationId: data.invitationId ?? null,
          userId: data.userId ?? null,
          memberId: data.memberId ?? null,
          status: data.status,
        })
        .returning();

      // Initialize leave balances for the new employee
      if (employee[0]) {
        try {
          // Import LeaveService dynamically to avoid circular dependency
          const { LeaveService } = await import("./leave.service");
          await LeaveService.initializeEmployeeLeaveBalances(
            employee[0].id,
            data.organizationId,
          );
        } catch (leaveError) {
          console.error(
            "Failed to initialize leave balances for new employee:",
            leaveError,
          );
          // Don't throw here - employee creation should succeed even if leave initialization fails
        }
      }

      await invalidatePattern(
        this.CACHE_KEYS.ORG_EMPLOYEES(data.organizationId),
      );

      if (data.userId) {
        await invalidatePattern(this.CACHE_KEYS.USER_EMPLOYEES(data.userId));
      }

      return employee[0];
    } catch (error) {
      console.error("Failed to create employee:", error);
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
      designation?: EmployeeDesignation;
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

      if (employee[0].userId) {
        await invalidateCache(
          this.CACHE_KEYS.CURRENT_EMPLOYEE(employee[0].userId, organizationId),
        );
        await invalidateCache(
          this.CACHE_KEYS.EMPLOYEE_BY_USER_ID(employee[0].userId),
        );
        await invalidatePattern(
          this.CACHE_KEYS.USER_EMPLOYEES(employee[0].userId),
        );
      }

      await invalidateCache(
        this.CACHE_KEYS.EMPLOYEE_BY_ID(organizationId, employeeId),
      );
      await invalidatePattern(this.CACHE_KEYS.ORG_EMPLOYEES(organizationId));

      return employee[0];
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      console.error("Failed to update employee:", error);
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

      if (deletedEmployee?.userId) {
        await invalidateCache(
          this.CACHE_KEYS.CURRENT_EMPLOYEE(
            deletedEmployee.userId,
            organizationId,
          ),
        );
        await invalidateCache(
          this.CACHE_KEYS.EMPLOYEE_BY_USER_ID(deletedEmployee.userId),
        );
        await invalidatePattern(
          this.CACHE_KEYS.USER_EMPLOYEES(deletedEmployee.userId),
        );
      }

      await invalidateCache(
        this.CACHE_KEYS.EMPLOYEE_BY_ID(organizationId, employeeId),
      );
      await invalidatePattern(this.CACHE_KEYS.ORG_EMPLOYEES(organizationId));

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
    const cacheKey = this.CACHE_KEYS.EMPLOYEE_BY_ID(organizationId, employeeId);

    return await cache(
      cacheKey,
      async () => {
        const result = await db
          .select({
            id: employees.id,
            designation: employees.designation,
            department: employees.department,
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
          department: employee.department,
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
      },
      { ttl: this.CACHE_TTL.EMPLOYEE_DETAIL },
    );
  }

  static async listEmployees(params: EmployeeListParams) {
    const paramsKey = JSON.stringify({
      limit: params.limit,
      offset: params.offset,
      searchQuery: params.searchQuery,
      designation: params.designation,
      status: params.status,
      sortBy: params.sortBy,
      sortDirection: params.sortDirection,
    });
    const cacheKey = this.CACHE_KEYS.EMPLOYEE_LIST(
      params.organizationId || "all",
      paramsKey,
    );

    return await cache(
      cacheKey,
      async () => {
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
              department: employees.department,
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

          const employeesWithUser: EmployeeWithUser[] = results.map(
            (employee) => ({
              id: employee.id,
              designation: employee.designation,
              department: employee.department,
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
            }),
          );

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
          console.error("Failed to fetch employees:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch employees",
          });
        }
      },
      { ttl: this.CACHE_TTL.EMPLOYEE_LIST },
    );
  }

  static async getEmployeeByUserId(userId: string) {
    const cacheKey = this.CACHE_KEYS.EMPLOYEE_BY_USER_ID(userId);

    return await cache(
      cacheKey,
      async () => {
        const employee = await db.query.employees.findFirst({
          where: eq(employees.userId, userId),
          with: {
            user: {
              columns: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
            organization: {
              columns: {
                id: true,
                name: true,
              },
            },
          },
        });

        return employee;
      },
      { ttl: this.CACHE_TTL.CURRENT_EMPLOYEE },
    );
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

      // Invalidate related caches after cancelling invitation
      await invalidatePattern(this.CACHE_KEYS.ORG_EMPLOYEES(organizationId));

      return { success: true };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      console.error("Failed to cancel invitation:", error);
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

      // Initialize leave balances when invitation is accepted (if not already done)
      if (employee[0]) {
        try {
          // Import LeaveService dynamically to avoid circular dependency
          const { LeaveService } = await import("./leave.service");
          await LeaveService.initializeEmployeeLeaveBalances(
            employee[0].id,
            organizationId,
          );
        } catch (leaveError) {
          console.error(
            "Failed to initialize leave balances for accepted invitation:",
            leaveError,
          );
          // Don't throw here - employee update should succeed even if leave initialization fails
        }
      }

      // Invalidate related caches after updating employee
      if (employee[0]) {
        await invalidateCache(
          this.CACHE_KEYS.CURRENT_EMPLOYEE(userId, organizationId),
        );
        await invalidateCache(this.CACHE_KEYS.EMPLOYEE_BY_USER_ID(userId));
        await invalidatePattern(this.CACHE_KEYS.USER_EMPLOYEES(userId));
        await invalidatePattern(this.CACHE_KEYS.ORG_EMPLOYEES(organizationId));
      }

      return employee[0];
    } catch (error) {
      console.error(
        "Failed to update employee after invitation acceptance:",
        error,
      );
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
    const cacheKey = this.CACHE_KEYS.CURRENT_EMPLOYEE(userId, organizationId);

    return await cache(
      cacheKey,
      async () => {
        const [employee] = await db
          .select({
            id: employees.id,
            designation: employees.designation,
            department: employees.department,
            createdAt: employees.createdAt,
            updatedAt: employees.updatedAt,
            deletedAt: employees.deletedAt,
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
      },
      { ttl: this.CACHE_TTL.CURRENT_EMPLOYEE },
    );
  }

  // Helper method to get employee counts by status with caching
  static async getEmployeeCount(
    organizationId: string,
    status?: EmployeeStatus,
  ) {
    const cacheKey = this.CACHE_KEYS.EMPLOYEE_COUNT(organizationId, status);

    return await cache(
      cacheKey,
      async () => {
        const filters = [
          eq(employees.organizationId, organizationId),
          sql`${employees.deletedAt} IS NULL`,
        ];

        if (status) {
          filters.push(eq(employees.status, status));
        }

        const result = await db
          .select({ count: sql<number>`count(*)` })
          .from(employees)
          .where(and(...filters));

        return Number(result[0]?.count) || 0;
      },
      { ttl: this.CACHE_TTL.EMPLOYEE_COUNT },
    );
  }

  // Helper method to get active vs invited employee counts
  static async getEmployeeStats(organizationId: string) {
    const cacheKey = `hrms:v1:org:${organizationId}:employee:stats`;

    return await cache(
      cacheKey,
      async () => {
        const [activeCount, invitedCount, totalCount] = await Promise.all([
          this.getEmployeeCount(organizationId, "active"),
          db
            .select({ count: sql<number>`count(*)` })
            .from(employees)
            .where(
              and(
                eq(employees.organizationId, organizationId),
                sql`${employees.deletedAt} IS NULL`,
                sql`${employees.userId} IS NULL`,
                sql`${employees.invitationId} IS NOT NULL`,
              ),
            )
            .then((result) => Number(result[0]?.count) || 0),
          this.getEmployeeCount(organizationId),
        ]);

        return {
          active: activeCount,
          invited: invitedCount,
          total: totalCount,
        };
      },
      { ttl: this.CACHE_TTL.EMPLOYEE_COUNT },
    );
  }
}
