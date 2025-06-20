import { relations } from "drizzle-orm";
import {
  boolean,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { employees } from "./employees";
import { attachments } from "./attachments";

// Document type enum
export const documentTypeEnum = pgEnum("document_type", [
  "policy",
  "handbook",
  "form",
  "contract",
  "notice",
  "procedure",
  "manual",
  "other",
]);

// Document visibility enum
export const documentVisibilityEnum = pgEnum("document_visibility", [
  "all",
  "employees",
  "managers",
  "hr",
  "private",
]);

// Documents table
export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: documentTypeEnum("type").notNull(),
  visibility: documentVisibilityEnum("visibility").notNull(),
  attachmentId: uuid("attachment_id")
    .notNull()
    .references(() => attachments.id, { onDelete: "cascade" }),
  uploadedBy: text("uploaded_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  employeeId: uuid("employee_id").references(() => employees.id, {
    onDelete: "set null",
  }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

// Relations
export const documentsRelations = relations(documents, ({ one }) => ({
  uploader: one(users, {
    fields: [documents.uploadedBy],
    references: [users.id],
  }),
  employee: one(employees, {
    fields: [documents.employeeId],
    references: [employees.id],
  }),
  attachment: one(attachments, {
    fields: [documents.attachmentId],
    references: [attachments.id],
  }),
}));

// Types
export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
export type DocumentType = Document["type"];
export type DocumentVisibility = Document["visibility"];
