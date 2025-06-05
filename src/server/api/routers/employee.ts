import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { employees } from "@/server/db/schema";
import { and, eq } from "drizzle-orm";
import { authClient } from "@/server/auth/auth-client";

export const employeeRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        organizationId: z.string(),
        name: z.string(),
        designation: z.string(),
        invitationId: z.string(),
        userId: z.string().optional(),
        memberId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;



      const employee = await db
        .insert(employees)
        .values({
          ...input,
        })
        .returning();

      return employee[0];
    }),

  // Update employee when invitation is accepted
  updateAfterInvitationAccepted: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        memberId: z.string(),
        organizationId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;

      const employee = await db
        .update(employees)
        .set({
          userId: input.userId,
          memberId: input.memberId,
        })
        .where(
          and(
            eq(employees.userId, input.userId),
            eq(employees.organizationId, input.organizationId),
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
    }),

 

  getByUserId: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db } = ctx;

      const employee = await db.query.employees.findFirst({
        where: eq(employees.userId, input.userId),
      });

      if (!employee) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Employee not found",
        });
      }

      return employee;
    }),
});
