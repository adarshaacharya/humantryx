import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { NewsService } from "@/server/api/services/news.service";

export const newsRouter = createTRPCRouter({
  // Get all news articles
  getNews: protectedProcedure.query(async ({ ctx }) => {
    return NewsService.getNews(ctx.session);
  }),

  // Create a new news article
  createNews: protectedProcedure
    .input(
      z.object({
        title: z
          .string()
          .min(1, "Title is required")
          .max(200, "Title too long"),
        content: z.string().min(10, "Content must be at least 10 characters"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return NewsService.createNews(ctx.session, input);
    }),

  // Update a news article
  updateNews: protectedProcedure
    .input(
      z.object({
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
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return NewsService.updateNews(ctx.session, input);
    }),

  // Delete a news article
  deleteNews: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid("Invalid news ID"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return NewsService.deleteNews(ctx.session, input);
    }),
});
