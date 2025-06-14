import { z } from "zod";

// Salary settings schema
export const setSalarySettingsSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  baseSalary: z.number().positive("Base salary must be positive"),
  taxPercentage: z
    .number()
    .min(0, "Tax percentage cannot be negative")
    .max(100, "Tax percentage cannot exceed 100%"),
});

// Generate payroll schema
export const generatePayrollSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  payrollMonth: z.string().regex(/^\d{4}-\d{2}$/, "Format should be YYYY-MM"),
  bonuses: z.number().min(0, "Bonuses cannot be negative").default(0),
  unpaidLeaveDays: z
    .number()
    .min(0, "Unpaid leave days cannot be negative")
    .default(0),
  notes: z.string().optional(),
});

// Update payment status schema
export const updatePaymentStatusSchema = z.object({
  payrollId: z.string().min(1, "Payroll ID is required"),
  status: z.enum(["pending", "paid", "cancelled"]),
  paymentDate: z.date().optional(),
  paymentReference: z.string().optional(),
});

// Payroll filters schema
export const payrollFiltersSchema = z.object({
  employeeId: z.string().optional(),
  payrollMonth: z.string().optional(),
  year: z.number().min(2020).max(2030).optional(),
  status: z.enum(["pending", "paid", "cancelled", "all"]).optional(),
});

// Export schema types
export type SetSalarySettingsForm = z.infer<typeof setSalarySettingsSchema>;
export type GeneratePayrollForm = z.infer<typeof generatePayrollSchema>;
export type UpdatePaymentStatusForm = z.infer<typeof updatePaymentStatusSchema>;
export type PayrollFiltersForm = z.infer<typeof payrollFiltersSchema>;
