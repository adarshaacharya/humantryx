import { pgTable, text, uuid, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { employees } from "./employees";
import { timestamps } from "./columns";

// News table
export const news = pgTable("news", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  authorId: uuid("author_id")
    .notNull()
    .references(() => employees.id, { onDelete: "cascade" }),
  organizationId: text("organization_id").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  ...timestamps,
});

// Relations
export const newsRelations = relations(news, ({ one }) => ({
  author: one(employees, {
    fields: [news.authorId],
    references: [employees.id],
  }),
}));

export type NewsArticle = typeof news.$inferSelect;
export type CreateNewsArticle = typeof news.$inferInsert;
