import {
  pgEnum,
  pgTable,
  text,
  uuid,
  timestamp,
  integer,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { employees } from "./employees";
import { timestamps } from "./columns";

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "paid",
  "cancelled",
]);

export const payrollRecords = pgTable("payroll_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  employeeId: uuid("employee_id")
    .notNull()
    .references(() => employees.id, { onDelete: "cascade" }),

  payrollMonth: text("payroll_month").notNull(), // Format: "2025-06"

  baseSalary: decimal("base_salary", { precision: 12, scale: 2 }).notNull(),
  bonuses: decimal("bonuses", { precision: 12, scale: 2 }).default("0"),
  allowances: decimal("allowances", { precision: 12, scale: 2 }).default("0"),

  totalWorkingDays: integer("total_working_days").notNull().default(30),
  unpaidLeaveDays: integer("unpaid_leave_days").default(0),
  perDayRate: decimal("per_day_rate", { precision: 12, scale: 2 }).notNull(),
  leaveDeduction: decimal("leave_deduction", {
    precision: 12,
    scale: 2,
  }).default("0"),

  taxPercentage: decimal("tax_percentage", { precision: 5, scale: 2 }).default(
    "0",
  ),
  taxDeduction: decimal("tax_deduction", { precision: 12, scale: 2 }).default(
    "0",
  ),

  grossPay: decimal("gross_pay", { precision: 12, scale: 2 }).notNull(),
  totalDeductions: decimal("total_deductions", {
    precision: 12,
    scale: 2,
  }).notNull(),
  netPay: decimal("net_pay", { precision: 12, scale: 2 }).notNull(),

  currency: text("currency").notNull().default("USD"),
  paymentStatus: paymentStatusEnum("payment_status")
    .notNull()
    .default("pending"),
  paymentDate: timestamp("payment_date"),
  paymentReference: text("payment_reference"), // Bank reference, transaction ID, etc.

  generatedBy: uuid("generated_by")
    .notNull()
    .references(() => employees.id),
  notes: text("notes"), // Additional notes for this payroll

  ...timestamps,
});

// Employee salary settings table
export const employeeSalarySettings = pgTable("employee_salary_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  employeeId: uuid("employee_id")
    .notNull()
    .references(() => employees.id, { onDelete: "cascade" })
    .unique(),

  baseSalary: decimal("base_salary", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("USD"),

  taxPercentage: decimal("tax_percentage", { precision: 5, scale: 2 }).default(
    "13",
  ), // Default Nepal tax
  customTaxAmount: decimal("custom_tax_amount", { precision: 12, scale: 2 }),

  allowances: decimal("monthly_allowances", {
    precision: 12,
    scale: 2,
  }).default("0"),
  isActive: boolean("is_active").notNull().default(true),

  updatedBy: uuid("updated_by")
    .notNull()
    .references(() => employees.id),

  ...timestamps,
});

// Relations
export const payrollRecordsRelations = relations(payrollRecords, ({ one }) => ({
  employee: one(employees, {
    fields: [payrollRecords.employeeId],
    references: [employees.id],
  }),
  generatedByEmployee: one(employees, {
    fields: [payrollRecords.generatedBy],
    references: [employees.id],
  }),
}));

export const employeeSalarySettingsRelations = relations(
  employeeSalarySettings,
  ({ one }) => ({
    employee: one(employees, {
      fields: [employeeSalarySettings.employeeId],
      references: [employees.id],
    }),
    updatedByEmployee: one(employees, {
      fields: [employeeSalarySettings.updatedBy],
      references: [employees.id],
    }),
  }),
);

export type PayrollRecord = typeof payrollRecords.$inferSelect;
export type CreatePayrollRecord = typeof payrollRecords.$inferInsert;
export type EmployeeSalarySettings = typeof employeeSalarySettings.$inferSelect;
export type CreateEmployeeSalarySettings =
  typeof employeeSalarySettings.$inferInsert;
