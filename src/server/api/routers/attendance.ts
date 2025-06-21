import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { AttendanceService } from "@/server/api/services/attendance.service";

export const attendanceRouter = createTRPCRouter({
  // Employee clock in
  clockIn: protectedProcedure
    .input(
      z.object({
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return AttendanceService.clockIn(ctx.session, input.notes);
    }),

  // Employee clock out
  clockOut: protectedProcedure
    .input(
      z.object({
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return AttendanceService.clockOut(ctx.session, input.notes);
    }),

  // Start break
  startBreak: protectedProcedure.mutation(async ({ ctx }) => {
    return AttendanceService.startBreak(ctx.session);
  }),

  // End break
  endBreak: protectedProcedure.mutation(async ({ ctx }) => {
    return AttendanceService.endBreak(ctx.session);
  }),

  // Get current attendance status
  getCurrentStatus: protectedProcedure.query(async ({ ctx }) => {
    return AttendanceService.getCurrentStatus(ctx.session);
  }),

  // Get attendance history
  getHistory: protectedProcedure
    .input(
      z.object({
        employeeId: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        page: z.number().optional(),
        limit: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return AttendanceService.getAttendanceHistory(ctx.session, input);
    }),

  // Get attendance summary
  getSummary: protectedProcedure
    .input(
      z.object({
        employeeId: z.string().optional(),
        month: z.number().optional(),
        year: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return AttendanceService.getAttendanceSummary(
        ctx.session,
        input.employeeId,
        input.month,
        input.year,
      );
    }),
});
