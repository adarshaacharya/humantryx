import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { DashboardService } from "../services/dashboard.service";
import { accessControl } from "../middleware/casl-middleware";
import { z } from "zod";

export const dashboardRouter = createTRPCRouter({
  getStats: protectedProcedure
    .use(
      accessControl(async (option, ability) => {
        return ability.can("manage", "Employee");
      }),
    )
    .query(async ({ ctx }) => {
      return DashboardService.getDashboardStats(ctx.session);
    }),

  getTeamAttendance: protectedProcedure
    .use(
      accessControl(async (option, ability) => {
        return ability.can("update", "Employee");
      }),
    )
    .query(async ({ ctx }) => {
      return DashboardService.getTeamAttendanceStats(ctx.session);
    }),

  getPendingLeaveRequests: protectedProcedure
    .use(
      accessControl(async (option, ability) => {
        return ability.can("update", "LeaveRequests");
      }),
    )
    .query(async ({ ctx }) => {
      return DashboardService.getTeamLeaveStats(ctx.session);
    }),

  getPersonalStats: protectedProcedure
    .input(
      z.object({
        employeeId: z.string(),
      }),
    )
    .use(
      accessControl(async (option, ability) => {
        const employeeId = option.input.employeeId;
        return ability.can("read", "Attendance", employeeId);
      }),
    )
    .query(async ({ ctx, input }) => {
      return DashboardService.getPersonalDashboardStats(
        ctx.session,
        input.employeeId,
      );
    }),
});
