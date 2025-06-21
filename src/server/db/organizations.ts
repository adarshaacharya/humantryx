import { pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";

// https://github.com/better-auth/better-auth/blob/2fe1be0e5f023be77b07206dd960f9fd38abba8c/packages/better-auth/src/plugins/organization/schema.ts#L51
export const invitationStatus = pgEnum("invitation_status", [
  "pending",
  "accepted",
  "rejected",
  "canceled",
]);

/**
 * owner: The user who created the organization by default. The owner has full control over the organization and can perform any action.

admin: Users with the admin role have full control over the organization except for deleting the organization or changing the owner.

member: Users with the member role have limited control over the organization. They can create projects, invite users, and manage projects they have created.

 */
export const orgMemberRole = pgEnum("org_member_role", [
  "owner", // highest rank, who create org
  "admin",
  "member",
]);

export const invitationRole = pgEnum("invitation_role", [
  "admin",
  "member",
  "guest",
]); // since owner is the one who invites, we don't need to include it here

export const organizations = pgTable("organizations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").unique(),
  logo: text("logo"),
  createdAt: timestamp("created_at").notNull(),
  metadata: text("metadata"),
});

export const members = pgTable("members", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  role: orgMemberRole("role").default("member").notNull(),

  createdAt: timestamp("created_at").notNull(),
});

export const invitations = pgTable("invitations", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: invitationRole("role"),
  status: invitationStatus("status").default("pending").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  inviterId: text("inviter_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

// Relations
export const organizationsRelations = relations(organizations, ({ many }) => ({
  members: many(members),
  invitations: many(invitations),
}));

export const membersRelations = relations(members, ({ one }) => ({
  organization: one(organizations, {
    fields: [members.organizationId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [members.userId],
    references: [users.id],
  }),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  organization: one(organizations, {
    fields: [invitations.organizationId],
    references: [organizations.id],
  }),
  inviter: one(users, {
    fields: [invitations.inviterId],
    references: [users.id],
  }),
}));
