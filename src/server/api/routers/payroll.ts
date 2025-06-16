import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { PayrollService } from "../services/payroll.service";
import { accessControl } from "../middleware/casl-middleware";

export const payrollRouter = createTRPCRouter({
  // Set up salary settings for an employee
  setSalarySettings: protectedProcedure
    .input(
      z.object({
        employeeId: z.string(),
        baseSalary: z.number().positive(),
        taxPercentage: z.number().min(0).max(100),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return PayrollService.setSalarySettings(ctx.session, input);
    }),

  // Get salary settings for an employee
  getSalarySettings: protectedProcedure
    .input(
      z.object({
        employeeId: z.string().optional(),
      }),
    )
    .use(
      accessControl(async (option, ability) => {
        const employeeId = option.input.employeeId;
        return ability.can("read", "SalarySettings", employeeId);
      }),
    )
    .query(async ({ ctx, input }) => {
      return PayrollService.getSalarySettings(ctx.session, input.employeeId);
    }),

  // Generate payroll for a specific month
  generatePayroll: protectedProcedure
    .input(
      z.object({
        employeeId: z.string(),
        payrollMonth: z
          .string()
          .regex(/^\d{4}-\d{2}$/, "Format should be YYYY-MM"),
        bonuses: z.number().optional().default(0),
        unpaidLeaveDays: z.number().optional().default(0),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return PayrollService.generatePayroll(ctx.session, input);
    }),

  // Get payroll records
  getPayrollRecords: protectedProcedure
    .input(
      z.object({
        employeeId: z.string().optional(),
        payrollMonth: z.string().optional(),
        year: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return PayrollService.getPayrollRecords(ctx.session, input);
    }),

  // Update payment status
  updatePaymentStatus: protectedProcedure
    .input(
      z.object({
        payrollId: z.string(),
        status: z.enum(["pending", "paid", "cancelled"]),
        paymentDate: z.date().optional(),
        paymentReference: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return PayrollService.updatePaymentStatus(ctx.session, input);
    }),

  // Get payroll by ID (for salary slip)
  getPayrollById: protectedProcedure
    .input(z.object({ payrollId: z.string() }))
    .query(async ({ ctx, input }) => {
      return PayrollService.getPayrollById(ctx.session, input.payrollId);
    }),

  // List employees with salary settings (for HR)
  getEmployeesWithSalarySettings: protectedProcedure.query(async ({ ctx }) => {
    return PayrollService.getEmployeesWithSalarySettings(ctx.session);
  }),
});
