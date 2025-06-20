import { pgEnum, pgTable, text, uuid, jsonb } from "drizzle-orm/pg-core";
import { users } from "./users";
import { defaultJsonbObject, timestamps } from "./columns";
import { relations } from "drizzle-orm";

export const attachmentTypes = pgEnum("attachment_types", [
  "image",
  "video",
  "audio",
  "document",
]);

export const attachments = pgTable("attachments", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" })
    .notNull(),

  fileName: text("file_name").notNull(),
  mimeType: text("mime_type").notNull(),
  extension: text("extension").notNull(),
  fullPath: text("full_path").notNull(),
  type: attachmentTypes("type"),

  title: text("title"),
  description: text("description"),

  metadata: jsonb().default(defaultJsonbObject),

  ...timestamps,
});

// relations
export const attachmentsRelations = relations(attachments, ({ one }) => ({
  user: one(users, {
    fields: [attachments.userId],
    references: [users.id],
  }),
}));

// types
export type Attachment = typeof attachments.$inferSelect;
export type CreateAttachment = typeof attachments.$inferInsert;
export type UpdateAttachment = typeof attachments.$inferInsert & {
  id: string;
};
