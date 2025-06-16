import { TRPCError } from "@trpc/server";
import { and, eq, desc } from "drizzle-orm";
import { db } from "@/server/db";
import { employees, news } from "@/server/db/schema";

type Session = {
  user: { id: string };
  session: { activeOrganizationId?: string | null | undefined };
};

export class NewsService {
  // Helper to validate employee access
  private static async validateEmployee(userId: string) {
    const employee = await db.query.employees.findFirst({
      where: eq(employees.userId, userId),
      with: {
        user: true,
      },
    });

    if (!employee) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Employee record not found",
      });
    }

    return employee;
  }

  // Get all news articles for an organization
  static async getNews(session: Session) {
    const activeOrgId = session.session.activeOrganizationId;

    if (!activeOrgId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No active organization selected",
      });
    }

    // Validate employee access
    await this.validateEmployee(session.user.id);

    const newsArticles = await db.query.news.findMany({
      where: and(eq(news.organizationId, activeOrgId), eq(news.isActive, true)),
      with: {
        author: {
          with: {
            user: true,
          },
        },
      },
      orderBy: [desc(news.createdAt)],
    });

    return newsArticles;
  }

  // Create a new news article
  static async createNews(
    session: Session,
    input: {
      title: string;
      content: string;
    },
  ) {
    const activeOrgId = session.session.activeOrganizationId;

    if (!activeOrgId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No active organization selected",
      });
    }

    // Validate employee access
    const employee = await this.validateEmployee(session.user.id);

    // Create news article
    const [newsArticle] = await db
      .insert(news)
      .values({
        title: input.title,
        content: input.content,
        authorId: employee.id,
        organizationId: activeOrgId,
      })
      .returning();

    // Get the complete news article with author info
    const completeNews = await db.query.news.findFirst({
      where: eq(news.id, newsArticle!.id),
      with: {
        author: {
          with: {
            user: true,
          },
        },
      },
    });

    return completeNews;
  }

  // Update a news article
  static async updateNews(
    session: Session,
    input: {
      id: string;
      title?: string;
      content?: string;
    },
  ) {
    const activeOrgId = session.session.activeOrganizationId;

    if (!activeOrgId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No active organization selected",
      });
    }

    // Validate employee access
    const employee = await this.validateEmployee(session.user.id);

    // Check if news article exists and belongs to the organization
    const existingNews = await db.query.news.findFirst({
      where: and(eq(news.id, input.id), eq(news.organizationId, activeOrgId)),
    });

    if (!existingNews) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "News article not found",
      });
    }

    // Check if user is the author
    if (existingNews.authorId !== employee.id) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You can only edit your own news articles",
      });
    }

    // Update the news article
    const updateData: Partial<typeof news.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (input.title) updateData.title = input.title;
    if (input.content) updateData.content = input.content;

    const [updatedNews] = await db
      .update(news)
      .set(updateData)
      .where(eq(news.id, input.id))
      .returning();

    // Get the complete updated news article with author info
    const completeNews = await db.query.news.findFirst({
      where: eq(news.id, updatedNews!.id),
      with: {
        author: {
          with: {
            user: true,
          },
        },
      },
    });

    return completeNews;
  }

  // Delete a news article
  static async deleteNews(
    session: Session,
    input: {
      id: string;
    },
  ) {
    const activeOrgId = session.session.activeOrganizationId;

    if (!activeOrgId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No active organization selected",
      });
    }

    // Validate employee access
    const employee = await this.validateEmployee(session.user.id);

    // Check if news article exists and belongs to the organization
    const existingNews = await db.query.news.findFirst({
      where: and(eq(news.id, input.id), eq(news.organizationId, activeOrgId)),
    });

    if (!existingNews) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "News article not found",
      });
    }

    // Check if user is the author or HR/admin
    const isAuthor = existingNews.authorId === employee.id;
    const isHRAdmin = ["hr", "founder"].includes(employee.designation);

    if (!isAuthor && !isHRAdmin) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message:
          "You can only delete your own news articles or you must be HR/Admin",
      });
    }

    // Soft delete the news article
    await db
      .update(news)
      .set({
        isActive: false,
        deletedAt: new Date(),
      })
      .where(eq(news.id, input.id));

    return { success: true };
  }
}
