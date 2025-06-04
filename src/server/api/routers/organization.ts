import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  organizations,
  members as membersTable,
  users as usersTable,
} from "@/server/db/schema";
import {
  createOrganizationSchema,
  joinOrganizationSchema,
} from "@/modules/auth/schemas/org";

export const organizationRouter = createTRPCRouter({
  //   getCurrent: protectedProcedure.query(async ({ ctx }) => {
  //     try {
  //       const { db, session } = ctx;

  //       const activeOrgId = session.session.activeOrganizationId;
  //       if (!activeOrgId) {
  //         throw new TRPCError({
  //           code: "NOT_FOUND",
  //           message: "No active organization found",
  //         });
  //       }

  //       // Fetch organization details
  //       const organization = await db.query.organizations.findFirst({
  //         where: eq(organizations.id, activeOrgId),
  //       });

  //       if (!organization) {
  //         throw new TRPCError({
  //           code: "NOT_FOUND",
  //           message: "Organization not found",
  //         });
  //       }

  //       // Fetch members with user details using raw query due to relation issues
  //       const members = await db
  //         .select({
  //           id: membersTable.id,
  //           role: membersTable.role,
  //           userId: membersTable.userId,
  //           organizationId: membersTable.organizationId,
  //           createdAt: membersTable.createdAt,
  //           userName: usersTable.name,
  //           userEmail: usersTable.email,
  //           userImage: usersTable.image,
  //         })
  //         .from(membersTable)
  //         .innerJoin(usersTable, eq(membersTable.userId, usersTable.id))
  //         .where(eq(membersTable.organizationId, activeOrgId));

  //       return {
  //         organization,
  //         members: members.map((member) => ({
  //           id: member.id,
  //           role: member.role,
  //           userId: member.userId,
  //           organizationId: member.organizationId,
  //           createdAt: member.createdAt,
  //           user: {
  //             name: member.userName,
  //             email: member.userEmail,
  //             image: member.userImage,
  //           },
  //         })),
  //       };
  //     } catch (error) {
  //       if (error instanceof TRPCError) {
  //         throw error;
  //       }
  //       throw new TRPCError({
  //         code: "INTERNAL_SERVER_ERROR",
  //         message: "Failed to fetch organization data",
  //       });
  //     }
  //   }),

  // Get current user's member info in the organization
  //   getCurrentMember: protectedProcedure.query(async ({ ctx }) => {
  //     const { db, session } = ctx;

  //     const activeOrgId = session.session.activeOrganizationId;
  //     if (!activeOrgId) {
  //       throw new TRPCError({
  //         code: "NOT_FOUND",
  //         message: "No active organization found",
  //       });
  //     }

  //     const member = await db.query.members.findFirst({
  //       where: and(
  //         eq(membersTable.organizationId, activeOrgId),
  //         eq(membersTable.userId, session.user.id),
  //       ),
  //     });

  //     if (!member) {
  //       throw new TRPCError({
  //         code: "NOT_FOUND",
  //         message: "Member not found in organization",
  //       });
  //     }

  //     return member;
  //   }),

  // Get organization overview data (combines organization + current member)
  getOverview: protectedProcedure.query(async ({ ctx }) => {
    const { db, session } = ctx;

    const activeOrgId = session.session.activeOrganizationId;
    if (!activeOrgId) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No active organization found",
      });
    }

    // Fetch both organization and member data in parallel
    const [organization, members, currentMember] = await Promise.all([
      db.query.organizations.findFirst({
        where: eq(organizations.id, activeOrgId),
      }),
      db
        .select({
          id: membersTable.id,
          role: membersTable.role,
          userId: membersTable.userId,
          organizationId: membersTable.organizationId,
          createdAt: membersTable.createdAt,
          userName: usersTable.name,
          userEmail: usersTable.email,
          userImage: usersTable.image,
        })
        .from(membersTable)
        .innerJoin(usersTable, eq(membersTable.userId, usersTable.id))
        .where(eq(membersTable.organizationId, activeOrgId)),
      db.query.members.findFirst({
        where: and(
          eq(membersTable.organizationId, activeOrgId),
          eq(membersTable.userId, session.user.id),
        ),
      }),
    ]);

    if (!organization) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Organization not found",
      });
    }

    if (!currentMember) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Member not found in organization",
      });
    }

    return {
      organization,
      currentMember,
      members: members.map((member) => ({
        id: member.id,
        role: member.role,
        userId: member.userId,
        organizationId: member.organizationId,
        createdAt: member.createdAt,
        user: {
          name: member.userName,
          email: member.userEmail,
          image: member.userImage,
        },
      })),
    };
  }),

  // Create a new organization
  create: protectedProcedure
    .input(createOrganizationSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, session, headers } = ctx;

      try {
        // Check if user already has an active organization
        const existingMember = await db.query.members.findFirst({
          where: eq(membersTable.userId, session.user.id),
        });

        if (existingMember) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "You are already a member of an organization",
          });
        }

        // Import auth dynamically to avoid circular dependencies
        const { auth } = await import("@/server/auth");

        // Create organization using better-auth
        const response = await auth.api.createOrganization({
          headers,
          body: {
            name: input.organizationData.name,
            slug: input.organizationData.slug,
          },
        });

        if (!response) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create organization",
          });
        }

        return { success: true, organization: response };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create organization",
        });
      }
    }),

  // Join an existing organization
  join: protectedProcedure
    .input(joinOrganizationSchema)
    .mutation(async ({ ctx, input }) => {
      const { headers } = ctx;

      try {
        const { auth } = await import("@/server/auth");

        const response = await auth.api.acceptInvitation({
          headers,
          body: {
            invitationId: input.joinData.inviteCode,
          },
        });

        if (!response) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Failed to join organization",
          });
        }

        return { success: true, organization: response };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to join organization",
        });
      }
    }),
});
