import {
  pgEnum,
  pgTable,
  text,
  uuid,
  integer,
  date,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { employees } from "./employees";
import { timestamps } from "./columns";

// Leave types enum
export const leaveTypeEnum = pgEnum("leave_type", [
  "annual",
  "sick",
  "casual",
  "maternity",
  "paternity",
  "emergency",
]);

// Leave status enum
export const leaveStatusEnum = pgEnum("leave_status", [
  "pending",
  "approved",
  "rejected",
  "cancelled",
]);

// Leave requests table
export const leaveRequests = pgTable("leave_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  employeeId: uuid("employee_id")
    .notNull()
    .references(() => employees.id, { onDelete: "cascade" }),
  leaveType: leaveTypeEnum("leave_type").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  totalDays: integer("total_days").notNull(),
  reason: text("reason").notNull(),
  status: leaveStatusEnum("status").notNull().default("pending"),
  approvedBy: uuid("approved_by").references(() => employees.id),
  approvedAt: date("approved_at"),
  rejectionReason: text("rejection_reason"),
  ...timestamps,
});

// Leave balances table
export const leaveBalances = pgTable("leave_balances", {
  id: uuid("id").defaultRandom().primaryKey(),
  employeeId: uuid("employee_id")
    .notNull()
    .references(() => employees.id, { onDelete: "cascade" }),
  leaveType: leaveTypeEnum("leave_type").notNull(),
  totalAllowed: integer("total_allowed").notNull().default(0),
  used: integer("used").notNull().default(0),
  remaining: integer("remaining").notNull().default(0),
  year: integer("year").notNull(),
  ...timestamps,
});

// Leave policies table (for organization-specific policies)
export const leavePolicies = pgTable("leave_policies", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: text("organization_id").notNull(),
  leaveType: leaveTypeEnum("leave_type").notNull(),
  defaultAllowance: integer("default_allowance").notNull(),
  carryForward: boolean("carry_forward").notNull().default(false),
  maxCarryForward: integer("max_carry_forward").default(0),
  isActive: boolean("is_active").notNull().default(true),
  ...timestamps,
});

// Relations
export const leaveRequestsRelations = relations(leaveRequests, ({ one }) => ({
  employee: one(employees, {
    fields: [leaveRequests.employeeId],
    references: [employees.id],
    relationName: "employee",
  }),
  approver: one(employees, {
    fields: [leaveRequests.approvedBy],
    references: [employees.id],
    relationName: "approver",
  }),
}));

export const leaveBalancesRelations = relations(leaveBalances, ({ one }) => ({
  employee: one(employees, {
    fields: [leaveBalances.employeeId],
    references: [employees.id],
  }),
}));

export const employeesLeavesRelations = relations(employees, ({ many }) => ({
  leaveRequests: many(leaveRequests, {
    relationName: "employee",
  }),
  leaveBalances: many(leaveBalances),
  approvedLeaveRequests: many(leaveRequests, {
    relationName: "approver",
  }),
}));
