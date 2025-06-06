import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { invitations, organizations } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const invitationRouter = createTRPCRouter({
  verify: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { id } = input;
      const { db } = ctx;

      const invitation = await db.query.invitations.findFirst({
        where: eq(invitations.id, id),
        with: {
          organization: {
            columns: {
              name: true,
              id: true,
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

      return {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        organizationName:
          invitation.organization?.name || "Unknown Organization",
        organizationId: invitation.organization?.id,
        expiresAt: invitation.expiresAt,
      };
    }),
});
