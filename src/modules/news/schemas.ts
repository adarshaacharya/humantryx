import { z } from "zod";

// Create news schema
export const createNewsSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  content: z.string().min(10, "Content must be at least 10 characters"),
});

// Update news schema
export const updateNewsSchema = z.object({
  id: z.string().uuid("Invalid news ID"),
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title too long")
    .optional(),
  content: z
    .string()
    .min(10, "Content must be at least 10 characters")
    .optional(),
});

// Delete news schema
export const deleteNewsSchema = z.object({
  id: z.string().uuid("Invalid news ID"),
});

// Export schema types
export type CreateNewsForm = z.infer<typeof createNewsSchema>;
export type UpdateNewsForm = z.infer<typeof updateNewsSchema>;
export type DeleteNewsForm = z.infer<typeof deleteNewsSchema>;
