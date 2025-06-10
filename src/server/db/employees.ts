import { pgEnum, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";
import { organizations, members, invitations } from "./organizations";
import { timestamps } from "./timestamps";

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
  status: employeeStatusEnum("status").notNull(),
  ...timestamps,
});

export type Employee = typeof employees.$inferSelect;
