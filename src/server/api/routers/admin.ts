import { superAdminProcedure, createTRPCRouter } from "../trpc";
import { z } from "zod";
import { and, desc, asc, eq, ilike, sql } from "drizzle-orm";
import { users } from "@/server/db/users";
import { members, organizations, invitations } from "@/server/db/organizations";

export const adminRouter = createTRPCRouter({
  listOrganizations: superAdminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        offset: z.number().min(0).default(0),
        searchQuery: z.string().optional(),
        sortBy: z
          .enum(["createdAt", "name", "memberCount"])
          .default("createdAt"),
        sortDirection: z.enum(["asc", "desc"]).default("desc"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { limit, offset, searchQuery, sortBy, sortDirection } = input;

      const filters = [];
      if (searchQuery) {
        filters.push(ilike(organizations.name, `%${searchQuery}%`));
      }

      // Get total count
      const totalCountResult = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(organizations)
        .$dynamic();

      const totalCount = Number(totalCountResult[0]?.count) || 0;
      const totalPages = Math.ceil(totalCount / limit);

      // Get organizations with member count
      const results = await ctx.db
        .select({
          id: organizations.id,
          name: organizations.name,
          slug: organizations.slug,
          createdAt: organizations.createdAt,
          metadata: organizations.metadata,
          memberCount: sql<number>`count(${members.id})`,
        })
        .from(organizations)
        .leftJoin(members, eq(organizations.id, members.organizationId))
        .where(and(...filters))
        .groupBy(organizations.id)
        .orderBy(
          sortBy === "memberCount"
            ? sortDirection === "desc"
              ? desc(sql<number>`count(${members.id})`)
              : asc(sql<number>`count(${members.id})`)
            : sortBy === "name"
              ? sortDirection === "desc"
                ? desc(organizations.name)
                : asc(organizations.name)
              : sortDirection === "desc"
                ? desc(organizations.createdAt)
                : asc(organizations.createdAt),
        )
        .limit(limit)
        .offset(offset);

      return {
        organizations: results.map((org) => ({
          id: org.id,
          name: org.name,
          slug: org.slug,
          createdAt: org.createdAt,
          membersCount: Number(org.memberCount),
          status: org.metadata?.includes("suspended")
            ? ("suspended" as const)
            : ("active" as const),
        })),
        totalPages,
      };
    }),

  updateOrganizationStatus: superAdminProcedure
    .input(
      z.object({
        organizationId: z.string(),
        status: z.enum(["active", "suspended"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { organizationId, status } = input;

      await ctx.db
        .update(organizations)
        .set({
          metadata: status === "suspended" ? "suspended" : null,
        })
        .where(eq(organizations.id, organizationId));

      return { success: true };
    }),

  listUsers: superAdminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        offset: z.number().min(0).default(0),
        searchQuery: z.string().optional(),
        sortBy: z.enum(["createdAt", "name", "email"]).default("createdAt"),
        sortDirection: z.enum(["asc", "desc"]).default("desc"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { limit, offset, searchQuery, sortBy, sortDirection } = input;

      const filters = [];
      if (searchQuery) {
        filters.push(
          sql`(${ilike(users.name, `%${searchQuery}%`)} OR ${ilike(
            users.email,
            `%${searchQuery}%`,
          )})`,
        );
      }

      const totalCountResult = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(and(...filters))
        .$dynamic();

      const totalCount = Number(totalCountResult[0]?.count) || 0;
      const totalPages = Math.ceil(totalCount / limit);

      const results = await ctx.db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          createdAt: users.createdAt,
          banned: users.banned,
          banReason: users.banReason,
          banExpires: users.banExpires,
        })
        .from(users)
        .where(and(...filters))
        .orderBy(
          sortBy === "email"
            ? sortDirection === "desc"
              ? desc(users.email)
              : asc(users.email)
            : sortBy === "name"
              ? sortDirection === "desc"
                ? desc(users.name)
                : asc(users.name)
              : sortDirection === "desc"
                ? desc(users.createdAt)
                : asc(users.createdAt),
        )
        .limit(limit)
        .offset(offset);

      return {
        users: results.map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          banned: user.banned,
          banReason: user.banReason,
          banExpires: user.banExpires,
        })),
        totalPages,
      };
    }),

  updateUserRole: superAdminProcedure
    .input(
      z.object({
        userId: z.string(),
        role: z.enum(["super_admin", "user"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, role } = input;

      await ctx.db.update(users).set({ role }).where(eq(users.id, userId));

      return { success: true };
    }),

  banUser: superAdminProcedure
    .input(
      z.object({
        userId: z.string(),
        banReason: z.string().optional(),
        banExpiresIn: z.number().optional(), // duration in seconds
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, banReason, banExpiresIn } = input;

      await ctx.db
        .update(users)
        .set({
          banned: true,
          banReason: banReason ?? "No reason provided",
          banExpires: banExpiresIn
            ? new Date(Date.now() + banExpiresIn * 1000)
            : null,
        })
        .where(eq(users.id, userId));

      return { success: true };
    }),

  unbanUser: superAdminProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = input;

      await ctx.db
        .update(users)
        .set({
          banned: false,
          banReason: null,
          banExpires: null,
        })
        .where(eq(users.id, userId));

      return { success: true };
    }),

  getStats: superAdminProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const firstDayOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
    ).toISOString();
    const weekAgo = new Date(
      now.getTime() - 7 * 24 * 60 * 60 * 1000,
    ).toISOString();

    // Get total organizations count and new this month
    const orgsResult = await ctx.db
      .select({
        total: sql<number>`count(*)`,
        newThisMonth: sql<number>`sum(case when ${organizations.createdAt} >= ${firstDayOfMonth} then 1 else 0 end)`,
      })
      .from(organizations)
      .$dynamic();

    // Get users statistics
    const usersResult = await ctx.db
      .select({
        total: sql<number>`count(*)`,
        banned: sql<number>`sum(case when ${users.banned} = true then 1 else 0 end)`,
        newThisMonth: sql<number>`sum(case when ${organizations.createdAt} >= ${firstDayOfMonth} then 1 else 0 end)`,
        bannedThisWeek: sql<number>`sum(case when ${users.banned} = true and ${users.updatedAt} >= ${weekAgo} then 1 else 0 end)`,
        admins: sql<number>`sum(case when ${users.role} = 'super_admin' then 1 else 0 end)`,
        adminsChange: sql<number>`sum(case when ${users.role} = 'super_admin' and ${users.updatedAt} >= ${firstDayOfMonth} then 1 else -1 end)`,
      })
      .from(users)
      .$dynamic();

    return {
      organizations: {
        total: Number(orgsResult[0]?.total ?? 0),
        newThisMonth: Number(orgsResult[0]?.newThisMonth ?? 0),
      },
      users: {
        total: Number(usersResult[0]?.total ?? 0),
        newThisMonth: Number(usersResult[0]?.newThisMonth ?? 0),
        banned: Number(usersResult[0]?.banned ?? 0),
        bannedThisWeek: Number(usersResult[0]?.bannedThisWeek ?? 0),
        admins: Number(usersResult[0]?.admins ?? 0),
        adminsChange: Number(usersResult[0]?.adminsChange ?? 0),
      },
    };
  }),

  listInvitations: superAdminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        offset: z.number().min(0).default(0),
        searchQuery: z.string().optional(),
        sortBy: z.enum(["createdAt", "email", "status"]).default("createdAt"),
        sortDirection: z.enum(["asc", "desc"]).default("desc"),
        status: z
          .enum(["pending", "accepted", "rejected", "canceled", "all"])
          .default("all"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { limit, offset, searchQuery, sortBy, sortDirection, status } =
        input;

      const filters = [];

      // Apply search filter
      if (searchQuery) {
        filters.push(ilike(invitations.email, `%${searchQuery}%`));
      }

      // Apply status filter
      if (status !== "all") {
        filters.push(eq(invitations.status, status));
      }

      // Get total count with filters
      const totalCountResult = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(invitations)
        .where(and(...filters))
        .$dynamic();

      const totalCount = Number(totalCountResult[0]?.count) || 0;
      const totalPages = Math.ceil(totalCount / limit);

      // Get invitations with related data
      const results = await ctx.db
        .select({
          id: invitations.id,
          email: invitations.email,
          status: invitations.status,
          role: invitations.role,
          expiresAt: invitations.expiresAt,
          organizationId: invitations.organizationId,
          inviterId: invitations.inviterId,
          organization: organizations.name,
          inviterName: users.name,
          inviterEmail: users.email,
        })
        .from(invitations)
        .leftJoin(
          organizations,
          eq(invitations.organizationId, organizations.id),
        )
        .leftJoin(users, eq(invitations.inviterId, users.id))
        .where(and(...filters))
        .orderBy(
          sortBy === "email"
            ? sortDirection === "desc"
              ? desc(invitations.email)
              : asc(invitations.email)
            : sortBy === "status"
              ? sortDirection === "desc"
                ? desc(invitations.status)
                : asc(invitations.status)
              : sortDirection === "desc"
                ? desc(invitations.expiresAt)
                : asc(invitations.expiresAt),
        )
        .limit(limit)
        .offset(offset);

      return {
        invitations: results.map((invitation) => ({
          id: invitation.id,
          email: invitation.email,
          status: invitation.status,
          role: invitation.role,
          expiresAt: invitation.expiresAt,
          organizationId: invitation.organizationId,
          organizationName: invitation.organization,
          inviterId: invitation.inviterId,
          inviterName: invitation.inviterName,
          inviterEmail: invitation.inviterEmail,
        })),
        totalPages,
        totalCount,
      };
    }),

  cancelInvitation: superAdminProcedure
    .input(
      z.object({
        invitationId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { invitationId } = input;

      await ctx.db
        .update(invitations)
        .set({
          status: "canceled",
        })
        .where(eq(invitations.id, invitationId));

      return { success: true };
    }),
});
