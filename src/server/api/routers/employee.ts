import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { EmployeeService } from "@/server/api/services/employee.service";
import { InvitationService } from "@/server/api/services/invitation.service";
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  employeeByIdSchema,
  employeeListSchema,
  deleteEmployeeSchema,
  inviteEmployeeSchema,
  cancelInvitationSchema,
  resendInvitationSchema,
  updateAfterInvitationSchema,
  getEmployeeByUserIdSchema,
} from "@/modules/employees/schemas/employee.schema";

export const employeeRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createEmployeeSchema)
    .mutation(async ({ ctx, input }) => {
      const { session } = ctx;

      // Verify user has access to the organization
      if (
        !session.session.activeOrganizationId ||
        session.session.activeOrganizationId !== input.organizationId
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not authorized to create employees in this organization",
        });
      }

      return await EmployeeService.createEmployee(input);
    }),

  // Update employee
  update: protectedProcedure
    .input(updateEmployeeSchema)
    .mutation(async ({ ctx, input }) => {
      const { session } = ctx;
      const { id, ...updateData } = input;

      if (
        !session.session.activeOrganizationId ||
        session.session.activeOrganizationId !== employee.organizationId
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not authorized to update this employee",
        });
      }

      return await EmployeeService.updateEmployee(
        id,
        employee.organizationId,
        updateData,
      );
    }),

  // Delete employee
  delete: protectedProcedure
    .input(deleteEmployeeSchema)
    .mutation(async ({ ctx, input }) => {
      const { session } = ctx;

      if (
        !session.session.activeOrganizationId ||
        session.session.activeOrganizationId !== input.organizationId
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not authorized to delete employees in this organization",
        });
      }

      return await EmployeeService.deleteEmployee(
        input.id,
        input.organizationId,
      );
    }),

  // Get employee by ID
  getById: protectedProcedure
    .input(employeeByIdSchema)
    .query(async ({ ctx, input }) => {
      const { session } = ctx;

      if (
        !session.session.activeOrganizationId ||
        session.session.activeOrganizationId !== input.organizationId
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not authorized to view employees in this organization",
        });
      }

      return await EmployeeService.getEmployeeById(
        input.id,
        input.organizationId,
      );
    }),

  // List employees with pagination, search, and filtering
  list: protectedProcedure
    .input(employeeListSchema)
    .query(async ({ ctx, input }) => {
      const { session } = ctx;

      const organizationId =
        input.organizationId || session.session.activeOrganizationId;

      if (!organizationId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Organization ID is required",
        });
      }

      if (session.session.activeOrganizationId !== organizationId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not authorized to view employees in this organization",
        });
      }

      return await EmployeeService.listEmployees({
        ...input,
        organizationId,
      });
    }),

  // Invite employee
  invite: protectedProcedure
    .input(inviteEmployeeSchema)
    .mutation(async ({ ctx, input }) => {
      const { session } = ctx;

      // Verify user has access to the organization
      if (
        !session.session.activeOrganizationId ||
        session.session.activeOrganizationId !== input.organizationId
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not authorized to invite employees to this organization",
        });
      }

      return await InvitationService.createEmployeeInvitation({
        email: input.email,
        organizationId: input.organizationId,
        inviterId: session.user.id,
        // employeeName: input.name,
        designation: input.designation,
      });
    }),

  // cancel invitation
  cancelInvitation: protectedProcedure
    .input(cancelInvitationSchema)
    .mutation(async ({ ctx, input }) => {
      const { session } = ctx;

      // Verify user has access to the organization
      if (
        !session.session.activeOrganizationId ||
        session.session.activeOrganizationId !== input.organizationId
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not authorized to cancel invitations in this organization",
        });
      }

      return await EmployeeService.cancelEmployeeInvitation(
        input.employeeId,
        input.organizationId,
      );
    }),

  resendInvitation: protectedProcedure
    .input(resendInvitationSchema)
    .mutation(async ({ ctx, input }) => {
      const { session } = ctx;

      // Verify user has access to the organization
      if (
        !session.session.activeOrganizationId ||
        session.session.activeOrganizationId !== input.organizationId
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not authorized to resend invitations in this organization",
        });
      }

      return await InvitationService.resendEmployeeInvitation(
        input.employeeId,
        input.organizationId,
      );
    }),

  // Update employee when invitation is accepted
  updateAfterInvitationAccepted: protectedProcedure
    .input(updateAfterInvitationSchema)
    .mutation(async ({ ctx, input }) => {
      return await EmployeeService.updateEmployeeAfterInvitationAccepted(
        input.userId,
        input.memberId,
        input.organizationId,
      );
    }),

  // Get employee by user ID
  getByUserId: protectedProcedure
    .input(getEmployeeByUserIdSchema)
    .query(async ({ ctx, input }) => {
      return await EmployeeService.getEmployeeByUserId(input.userId);
    }),
});
