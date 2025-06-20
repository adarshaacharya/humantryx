import { sql } from "drizzle-orm";
import { timestamp } from "drizzle-orm/pg-core";

export const timestamps = {
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at"),
};

/**
 * Default value for JSON/JSONB column
 *
 * usage example:
 * someField: jsonb().default(defaultJsonbObject)
 * someFieldTyped: jsonb()<MyJsonType>.default(defaultJsonbArray)
 */
export const defaultJsonbObject = sql`'{}'::jsonb`;
export const defaultJsonbArray = sql`'[]'::jsonb`;
