import { pgEnum, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { exists, relations } from "drizzle-orm";
import { users } from "./users";
import { organizations, members, invitations } from "./organizations";
import { timestamps } from "./columns";

export const employeeStatusEnum = pgEnum("employee_status", [
  "active",
  "invited",
  "terminated",
  "resigned",
  "on_leave",
]);

export const employeeDesignationEnum = pgEnum("employee_designation", [
  "software_engineer",
  "product_manager",
  "designer",
  "data_scientist",
  "quality_assurance",
  "devops_engineer",
  "system_administrator",
  "business_analyst",
  "project_manager",
  "hr",
  "founder",
]);

export const employeeDepartmentEnum = pgEnum("department", [
  "engineering",
  "product",
  "system_administration",
  "business_analysis",
  "founder_office",
  "human_resources",
]);

export const employees = pgTable("employees", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  memberId: text("member_id").references(() => members.id, {
    onDelete: "cascade",
  }),
  invitationId: text("invitation_id").references(() => invitations.id, {
    onDelete: "set null",
  }),
  designation: employeeDesignationEnum("designation").notNull(),
  department: employeeDepartmentEnum("department").notNull(),
  status: employeeStatusEnum("status").notNull(),
  ...timestamps,
});

// Relations
export const employeesRelations = relations(employees, ({ one }) => ({
  user: one(users, {
    fields: [employees.userId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [employees.organizationId],
    references: [organizations.id],
  }),
  member: one(members, {
    fields: [employees.memberId],
    references: [members.id],
  }),
  invitation: one(invitations, {
    fields: [employees.invitationId],
    references: [invitations.id],
  }),
}));

export type Employee = typeof employees.$inferSelect;
