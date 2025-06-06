import { db } from "@/server/db";
import { employees } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { headers } from "next/headers";

export class EmployeeInvitationService {
  static async createEmployeeInvitation(data: {
    email: string;
    organizationId: string;
    inviterId: string;
    employeeName: string;
    designation: string;
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

      // Create employee record linked to the invitation
      const employee = await db
        .insert(employees)
        .values({
          name: data.employeeName,
          designation: data.designation,
          organizationId: data.organizationId,
          invitationId: invitationResult.id,
          userId: null, // Will be set when invitation is accepted
          memberId: null, // Will be set when invitation is accepted
        })
        .returning();

      return {
        success: true,
        invitation: {
          id: invitationResult.id,
          email: data.email,
          organizationId: data.organizationId,
          expiresAt: invitationResult.expiresAt,
        },
        employee: employee[0],
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

      // Get current invitation details to retrieve the email
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

      // Use Better Auth to resend invitation by canceling old one and creating new
      // First cancel the existing invitation
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
        message: "Failed to resend invitation",
      });
    }
  }

  static async getInvitationDetails(invitationId: string) {
    try {
      // Import auth dynamically to avoid circular dependencies
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
}
