import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";
import { organizations, members, invitations } from "./organizations";
import { timestamps } from "./timestamps";

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
  name: text("name").notNull(),
  designation: text("designation").notNull(),
  ...timestamps,
});
