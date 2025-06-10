import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  createLeaveRequestSchema,
  approveRejectLeaveSchema,
  leaveRequestListSchema,
  leaveBalanceSchema,
  createLeavePolicySchema,
  updateLeavePolicySchema,
} from "@/modules/leaves/schemas";
import { LeaveService } from "../services/leave.service";

export const leaveRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createLeaveRequestSchema)
    .mutation(async ({ ctx, input }) => {
      return LeaveService.createLeaveRequest(input, ctx.session);
    }),

  list: protectedProcedure
    .input(leaveRequestListSchema)
    .query(async ({ ctx, input }) => {
      return LeaveService.getLeaveRequests(input, ctx.session);
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return LeaveService.getLeaveRequestById(input.id, ctx.session);
    }),

  updateStatus: protectedProcedure
    .input(approveRejectLeaveSchema)
    .mutation(async ({ ctx, input }) => {
      return LeaveService.updateLeaveStatus(input, ctx.session);
    }),

  getBalances: protectedProcedure
    .input(leaveBalanceSchema)
    .query(async ({ ctx, input }) => {
      return LeaveService.getLeaveBalances(input.employeeId, ctx.session);
    }),

  adjustBalance: protectedProcedure
    .input(
      z.object({
        employeeId: z.string().uuid(),
        leaveType: z.enum([
          "annual",
          "sick",
          "casual",
          "maternity",
          "paternity",
          "emergency",
        ]),
        adjustment: z.number(),
        reason: z.string().min(5, "Reason is required"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return LeaveService.adjustLeaveBalance(
        input.employeeId,
        input.leaveType,
        input.adjustment,
        input.reason,
        ctx.session,
      );
    }),

  getLeavePolicies: protectedProcedure.query(async ({ ctx }) => {
    return LeaveService.getLeavePolicies(ctx.session);
  }),

  createLeavePolicy: protectedProcedure
    .input(createLeavePolicySchema)
    .mutation(async ({ ctx, input }) => {
      return LeaveService.createLeavePolicy(input, ctx.session);
    }),

  updateLeavePolicy: protectedProcedure
    .input(updateLeavePolicySchema)
    .mutation(async ({ ctx, input }) => {
      return LeaveService.updateLeavePolicy(input, ctx.session);
    }),

  deleteLeavePolicy: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return LeaveService.deleteLeavePolicy(input.id, ctx.session);
    }),
});
