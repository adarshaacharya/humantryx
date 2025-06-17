import { TRPCError } from "@trpc/server";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/server/db";
import { employees, invitations, members, users } from "@/server/db/schema";
import type { InvitationWithDetails } from "@/modules/employees/types/invitation.types";
import type { PaginationOptions } from "@/types/table";
import type {
  EmployeeDepartment,
  EmployeeDesignation,
} from "@/server/db/consts";

export interface SortOptions {
  sortBy: "email" | "status" | "createdAt" | "expiresAt";
  sortDirection: "asc" | "desc";
}

export interface FilterOptions {
  searchQuery?: string;
  status?: "pending" | "accepted" | "canceled" | "expired" | "all";
}

export interface InvitationListParams
  extends PaginationOptions,
    SortOptions,
    FilterOptions {
  organizationId: string;
}

export class InvitationService {
  /**
   * Create an employee invitation
   */
  static async createEmployeeInvitation(data: {
    email: string;
    organizationId: string;
    inviterId: string;
    designation: EmployeeDesignation;
    department: EmployeeDepartment;
  }) {
    try {
      const { auth } = await import("@/server/auth");

      const invitationResult = await auth.api.createInvitation({
        headers: await headers(),
        body: {
          email: data.email,
          organizationId: data.organizationId,
          role: "member", // Default role for employees
        },
      });

      if (!invitationResult) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create organization invitation",
        });
      }

      const [employee] = await db
        .insert(employees)
        .values({
          organizationId: data.organizationId,
          invitationId: invitationResult.id,
          designation: data.designation,
          status: "invited", // Default status for new invitations
          department: data.department,
        })
        .returning()
        .execute();

      if (!employee) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create employee record",
        });
      }

      return {
        success: true,
        id: invitationResult.id,
        email: data.email,
        organizationId: data.organizationId,
        expiresAt: invitationResult.expiresAt,
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;

      // Handle Better Auth specific errors
      if (error && typeof error === "object" && "message" in error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message as string,
        });
      }

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create employee invitation",
      });
    }
  }

  /**
   * Resend an employee invitation by employee ID
   */
  static async resendEmployeeInvitation(
    employeeId: string,
    organizationId: string,
  ) {
    try {
      // Get employee with invitation
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
          message: "Employee has no invitation to resend",
        });
      }

      // Import auth dynamically to avoid circular dependencies
      const { auth } = await import("@/server/auth");

      const currentInvitation = await auth.api.getInvitation({
        headers: await headers(),
        query: {
          id: employee.invitationId,
        },
      });

      if (!currentInvitation?.email) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Original invitation email not found",
        });
      }

      await auth.api.cancelInvitation({
        headers: await headers(),
        body: {
          invitationId: employee.invitationId,
        },
      });

      // Create a new invitation using Better Auth
      const newInvitationResult = await auth.api.createInvitation({
        headers: await headers(),
        body: {
          email: currentInvitation.email,
          organizationId: organizationId,
          role: "member",
        },
      });

      if (!newInvitationResult) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create new invitation",
        });
      }

      // Update employee record with new invitation ID
      const updatedEmployee = await db
        .update(employees)
        .set({
          invitationId: newInvitationResult.id,
          updatedAt: new Date(),
        })
        .where(eq(employees.id, employeeId))
        .returning();

      return {
        success: true,
        invitation: {
          id: newInvitationResult.id,
          expiresAt: newInvitationResult.expiresAt,
        },
        employee: updatedEmployee[0],
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Failed to resend employee invitation",
      });
    }
  }

  /**
   * Resend an invitation by invitation ID (for router compatibility)
   */
  static async resendInvitation(invitationId: string, organizationId: string) {
    try {
      const employee = await db.query.employees.findFirst({
        where: and(
          eq(employees.invitationId, invitationId),
          eq(employees.organizationId, organizationId),
        ),
      });

      if (!employee) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Employee not found for this invitation",
        });
      }

      return await this.resendEmployeeInvitation(employee.id, organizationId);
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to resend invitation",
      });
    }
  }

  /**
   * Get invitation details
   */
  static async getInvitationDetails(
    invitationId: string,
    organizationId?: string,
  ) {
    try {
      const { auth } = await import("@/server/auth");

      const invitation = await auth.api.getInvitation({
        headers: await headers(),
        query: {
          id: invitationId,
        },
      });

      if (!invitation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invitation not found",
        });
      }

      // Verify organization access if organizationId is provided
      if (organizationId && invitation.organizationId !== organizationId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Invitation does not belong to this organization",
        });
      }

      const employee = await db.query.employees.findFirst({
        where: eq(employees.invitationId, invitationId),
      });

      return {
        invitation,
        employee,
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get invitation details",
      });
    }
  }

  /**
   * List invitations with database query patterns
   */
  static async listInvitations(params: InvitationListParams) {
    try {
      const {
        organizationId,
        limit,
        offset,
        searchQuery,
        status,
        sortBy,
        sortDirection,
      } = params;

      const { auth } = await import("@/server/auth");

      const allInvitations = await auth.api.listInvitations({
        headers: await headers(),
        query: {
          organizationId,
        },
      });

      if (!allInvitations) {
        return {
          invitations: [],
          pagination: {
            totalCount: 0,
            totalPages: 0,
            currentPage: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        };
      }

      const filteredInvitations = allInvitations.filter((invitation) => {
        if (status !== "all" && invitation.status !== status) {
          return false;
        }

        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            invitation.email.toLowerCase().includes(query) ||
            invitation.role?.toLowerCase().includes(query)
          );
        }

        return true;
      });

      filteredInvitations.sort((a, b) => {
        let comparison = 0;

        switch (sortBy) {
          case "email":
            comparison = a.email.localeCompare(b.email);
            break;
          case "status":
            comparison = a.status.localeCompare(b.status);
            break;
          case "expiresAt":
            comparison =
              new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
            break;
          case "createdAt":
          default:
            // Better Auth doesn't provide createdAt, so we'll use expiresAt as fallback
            comparison =
              new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
            break;
        }

        return sortDirection === "desc" ? -comparison : comparison;
      });

      const totalCount = filteredInvitations.length;
      const totalPages = Math.ceil(totalCount / limit);
      const currentPage = Math.floor(offset / limit) + 1;

      const paginatedInvitations = filteredInvitations.slice(
        offset,
        offset + limit,
      );

      const enrichedInvitations: InvitationWithDetails[] = [];

      for (const invitation of paginatedInvitations) {
        const inviter = await db.query.users.findFirst({
          where: eq(users.id, invitation.inviterId),
          columns: {
            name: true,
            email: true,
          },
        });

        // Get linked employee details if exists
        const employee = await db.query.employees.findFirst({
          where: eq(employees.invitationId, invitation.id),
          columns: {
            id: true,
            designation: true,
          },
        });

        enrichedInvitations.push({
          ...invitation,
          inviterName: inviter?.name ?? null,
          inviterEmail: inviter?.email ?? null,
          employeeId: employee?.id ?? null,
          employeeDesignation: employee?.designation ?? null,
        });
      }

      return {
        invitations: enrichedInvitations,
        pagination: {
          totalCount,
          totalPages,
          currentPage,
          hasNextPage: currentPage < totalPages,
          hasPreviousPage: currentPage > 1,
        },
      };
    } catch (error) {
      console.error("Error listing invitations:", error);
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to list invitations",
      });
    }
  }

  /**
   * Cancel an invitation using Better Auth
   */
  static async cancelInvitation(invitationId: string, organizationId: string) {
    try {
      const { auth } = await import("@/server/auth");

      const invitation = await auth.api.getInvitation({
        headers: await headers(),
        query: {
          id: invitationId,
        },
      });

      if (!invitation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invitation not found",
        });
      }

      if (invitation.organizationId !== organizationId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Invitation does not belong to this organization",
        });
      }
      const result = await auth.api.cancelInvitation({
        headers: await headers(),
        body: {
          invitationId: invitationId,
        },
      });

      return {
        success: true,
        cancelledInvitation: result,
      };
    } catch (error) {
      console.error("Error cancelling invitation:", error);
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Failed to cancel invitation",
      });
    }
  }

  /**
   * Accept an invitation using Better Auth
   */
  static async acceptInvitation(invitationId: string) {
    try {
      const { auth } = await import("@/server/auth");

      const result = await auth.api.acceptInvitation({
        headers: await headers(),
        body: {
          invitationId: invitationId,
        },
      });

      return {
        success: true,
        acceptedInvitation: result,
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Failed to accept invitation",
      });
    }
  }

  static async completeEmployeeOnboarding(data: {
    invitationId: string;
    userId: string;
    organizationId: string;
  }) {
    try {
      const { auth } = await import("@/server/auth");

      const invitation = await db.query.invitations.findFirst({
        where: eq(invitations.id, data.invitationId),
        with: {
          organization: {
            columns: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!invitation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invitation not found",
        });
      }

      if (invitation.status !== "accepted") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invitation must be accepted to complete onboarding",
        });
      }
      const member = await db.query.members
        .findFirst({
          where: and(
            eq(members.userId, data.userId),
            eq(members.organizationId, data.organizationId),
          ),
        })
        .execute();

      if (!member) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Member not found in the organization",
        });
      }

      // update employee record with userId and memberId
      const [updatedEmployee] = await db
        .update(employees)
        .set({
          userId: data.userId,
          memberId: member.id,
          status: "active",
        })
        .where(eq(employees.invitationId, data.invitationId))
        .returning()
        .execute();

      if (!updatedEmployee) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update employee after onboarding",
        });
      }

      await auth.api.setActiveOrganization({
        headers: await headers(),
        body: {
          organizationId: updatedEmployee?.organizationId,
        },
      });

      return updatedEmployee;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Failed to complete onboarding",
      });
    }
  }

  static async verifyInvitation(invitationId: string) {
    try {
      const invitation = await db.query.invitations.findFirst({
        where: eq(invitations.id, invitationId),
        with: {
          organization: {
            columns: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!invitation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invitation not found or has expired",
        });
      }

      if (
        invitation.status !== "pending" ||
        (invitation.expiresAt && new Date(invitation.expiresAt) < new Date())
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invitation has expired or is no longer valid",
        });
      }

      return invitation;
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Failed to verify invitation",
      });
    }
  }
}
