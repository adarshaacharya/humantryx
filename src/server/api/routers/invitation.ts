import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { InvitationService } from "@/server/api/services/invitation.service";
import {
  invitationListSchema,
  cancelInvitationByIdSchema,
  resendInvitationByIdSchema,
  invitationByIdSchema,
} from "@/modules/employees/schemas/invitation.schema";

export const invitationRouter = createTRPCRouter({
  // List invitations for an organization
  list: protectedProcedure
    .input(invitationListSchema)
    .query(async ({ ctx, input }) => {
      const { session } = ctx;

      // Ensure user has access to the organization
      if (!session.session.activeOrganizationId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Organization ID is required",
        });
      }

      if (session.session.activeOrganizationId !== input.organizationId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not authorized to view invitations in this organization",
        });
      }

      return await InvitationService.listInvitations(input);
    }),

  // Cancel an invitation
  cancel: protectedProcedure
    .input(cancelInvitationByIdSchema)
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

      return await InvitationService.cancelInvitation(
        input.invitationId,
        input.organizationId,
      );
    }),

  // Resend an invitation
  resend: protectedProcedure
    .input(resendInvitationByIdSchema)
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

      return await InvitationService.resendInvitation(
        input.invitationId,
        input.organizationId,
      );
    }),

  // Get invitation details
  getDetails: protectedProcedure
    .input(invitationByIdSchema)
    .query(async ({ ctx, input }) => {
      const { session } = ctx;

      // Verify user has access to the organization
      if (
        !session.session.activeOrganizationId ||
        session.session.activeOrganizationId !== input.organizationId
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "Not authorized to view invitation details in this organization",
        });
      }

      return await InvitationService.getInvitationDetails(
        input.invitationId,
        input.organizationId,
      );
    }),
});
