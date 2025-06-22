import { TRPCError } from "@trpc/server";
import { and, eq, desc, sql } from "drizzle-orm";
import { db } from "@/server/db";
import { employees, news } from "@/server/db/schema";
import { cache, invalidateCache, invalidatePattern } from "@/lib/redis";

type Session = {
  user: { id: string };
  session: { activeOrganizationId?: string | null | undefined };
};

export class NewsService {
  private static readonly CACHE_KEYS = {
    // Organization news list - org:123:news
    ORG_NEWS: (orgId: string) => `hrms:v1:org:${orgId}:news`,

    // Individual news article - org:123:news:456
    NEWS_BY_ID: (orgId: string, newsId: string) =>
      `hrms:v1:org:${orgId}:news:${newsId}`,

    // News count for organization - org:123:news:count
    NEWS_COUNT: (orgId: string) => `hrms:v1:org:${orgId}:news:count`,

    // Author's news articles - author:123:news
    AUTHOR_NEWS: (authorId: string) => `hrms:v1:author:${authorId}:news`,

    // Pattern for org news invalidation
    ORG_NEWS_PATTERN: (orgId: string) => `hrms:v1:org:${orgId}:news:*`,

    // Pattern for author news invalidation
    AUTHOR_NEWS_PATTERN: (authorId: string) => `hrms:v1:author:${authorId}:*`,
  } as const;

  private static readonly CACHE_TTL = {
    NEWS_LIST: 60, // 1 minute - news changes frequently
    NEWS_DETAIL: 60, // 1 minute - individual articles change less
    NEWS_COUNT: 60, // 1 minute - counts change less frequently
    AUTHOR_NEWS: 900, // 15 minutes - author's articles
  } as const;
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

  static async getNews(session: Session) {
    const activeOrgId = session.session.activeOrganizationId;

    if (!activeOrgId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No active organization selected",
      });
    }

    await this.validateEmployee(session.user.id);

    const cacheKey = this.CACHE_KEYS.ORG_NEWS(activeOrgId);

    return await cache(
      cacheKey,
      async () => {
        const newsArticles = await db.query.news.findMany({
          where: and(
            eq(news.organizationId, activeOrgId),
            eq(news.isActive, true),
          ),
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
      },
      { ttl: this.CACHE_TTL.NEWS_LIST },
    );
  }

  // Create a new news article
  static async createNews(
    session: Session,
    input: {
      title: string;
      content: string;
    },
  ) {
    try {
      const activeOrgId = session.session.activeOrganizationId;

      if (!activeOrgId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No active organization selected",
        });
      }

      const employee = await this.validateEmployee(session.user.id);

      const [newsArticle] = await db
        .insert(news)
        .values({
          title: input.title,
          content: input.content,
          authorId: employee.id,
          organizationId: activeOrgId,
        })
        .returning();

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

      // Invalidate related caches after creating news
      await invalidateCache(this.CACHE_KEYS.ORG_NEWS(activeOrgId));
      await invalidateCache(this.CACHE_KEYS.NEWS_COUNT(activeOrgId));
      await invalidatePattern(this.CACHE_KEYS.ORG_NEWS_PATTERN(activeOrgId));
      await invalidatePattern(this.CACHE_KEYS.AUTHOR_NEWS_PATTERN(employee.id));

      // Immediately refresh the organization news cache with latest data
      const cacheKey = this.CACHE_KEYS.ORG_NEWS(activeOrgId);
      const freshNews = await db.query.news.findMany({
        where: and(
          eq(news.organizationId, activeOrgId),
          eq(news.isActive, true),
        ),
        with: {
          author: {
            with: {
              user: true,
            },
          },
        },
        orderBy: [desc(news.createdAt)],
      });
      
      // Update cache with fresh data
      await cache(cacheKey, async () => freshNews, { 
        ttl: this.CACHE_TTL.NEWS_LIST 
      });

      return completeNews;
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      console.error("Failed to create news:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create news article",
      });
    }
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
    try {
      const activeOrgId = session.session.activeOrganizationId;

      if (!activeOrgId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No active organization selected",
        });
      }

      const employee = await this.validateEmployee(session.user.id);

      const existingNews = await db.query.news.findFirst({
        where: and(eq(news.id, input.id), eq(news.organizationId, activeOrgId)),
      });

      if (!existingNews) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "News article not found",
        });
      }

      if (existingNews.authorId !== employee.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only edit your own news articles",
        });
      }

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

      // Invalidate related caches after updating news
      await invalidateCache(this.CACHE_KEYS.ORG_NEWS(activeOrgId));
      await invalidateCache(this.CACHE_KEYS.NEWS_BY_ID(activeOrgId, input.id));
      await invalidateCache(this.CACHE_KEYS.NEWS_COUNT(activeOrgId));
      await invalidatePattern(this.CACHE_KEYS.ORG_NEWS_PATTERN(activeOrgId));
      await invalidatePattern(this.CACHE_KEYS.AUTHOR_NEWS_PATTERN(employee.id));

      // Immediately refresh the organization news cache with latest data
      const cacheKey = this.CACHE_KEYS.ORG_NEWS(activeOrgId);
      const freshNews = await db.query.news.findMany({
        where: and(
          eq(news.organizationId, activeOrgId),
          eq(news.isActive, true),
        ),
        with: {
          author: {
            with: {
              user: true,
            },
          },
        },
        orderBy: [desc(news.createdAt)],
      });
      
      // Update cache with fresh data
      await cache(cacheKey, async () => freshNews, { 
        ttl: this.CACHE_TTL.NEWS_LIST 
      });

      return completeNews;
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      console.error("Failed to update news:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to update news article",
      });
    }
  }

  // Delete a news article
  static async deleteNews(
    session: Session,
    input: {
      id: string;
    },
  ) {
    try {
      const activeOrgId = session.session.activeOrganizationId;

      if (!activeOrgId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No active organization selected",
        });
      }

      const employee = await this.validateEmployee(session.user.id);

      const existingNews = await db.query.news.findFirst({
        where: and(eq(news.id, input.id), eq(news.organizationId, activeOrgId)),
      });

      if (!existingNews) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "News article not found",
        });
      }

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

      // Invalidate related caches after deleting news
      await invalidateCache(this.CACHE_KEYS.ORG_NEWS(activeOrgId));
      await invalidateCache(this.CACHE_KEYS.NEWS_BY_ID(activeOrgId, input.id));
      await invalidateCache(this.CACHE_KEYS.NEWS_COUNT(activeOrgId));
      await invalidatePattern(this.CACHE_KEYS.ORG_NEWS_PATTERN(activeOrgId));
      await invalidatePattern(
        this.CACHE_KEYS.AUTHOR_NEWS_PATTERN(existingNews.authorId),
      );

      // Immediately refresh the organization news cache with latest data
      const cacheKey = this.CACHE_KEYS.ORG_NEWS(activeOrgId);
      const freshNews = await db.query.news.findMany({
        where: and(
          eq(news.organizationId, activeOrgId),
          eq(news.isActive, true),
        ),
        with: {
          author: {
            with: {
              user: true,
            },
          },
        },
        orderBy: [desc(news.createdAt)],
      });
      
      // Update cache with fresh data
      await cache(cacheKey, async () => freshNews, { 
        ttl: this.CACHE_TTL.NEWS_LIST 
      });

      return { success: true };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      console.error("Failed to delete news:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to delete news article",
      });
    }
  }

  // Get individual news article with caching
  static async getNewsById(orgId: string, newsId: string) {
    const cacheKey = this.CACHE_KEYS.NEWS_BY_ID(orgId, newsId);

    return await cache(
      cacheKey,
      async () => {
        const newsArticle = await db.query.news.findFirst({
          where: and(
            eq(news.id, newsId),
            eq(news.organizationId, orgId),
            eq(news.isActive, true),
          ),
          with: {
            author: {
              with: {
                user: true,
              },
            },
          },
        });

        if (!newsArticle) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "News article not found",
          });
        }

        return newsArticle;
      },
      { ttl: this.CACHE_TTL.NEWS_DETAIL },
    );
  }

  // Get news count for organization with caching
  static async getNewsCount(orgId: string) {
    const cacheKey = this.CACHE_KEYS.NEWS_COUNT(orgId);

    return await cache(
      cacheKey,
      async () => {
        const countResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(news)
          .where(and(eq(news.organizationId, orgId), eq(news.isActive, true)));

        return Number(countResult[0]?.count) || 0;
      },
      { ttl: this.CACHE_TTL.NEWS_COUNT },
    );
  }

  // Get news by author with caching
  static async getNewsByAuthor(authorId: string) {
    const cacheKey = this.CACHE_KEYS.AUTHOR_NEWS(authorId);

    return await cache(
      cacheKey,
      async () => {
        const authorNews = await db.query.news.findMany({
          where: and(eq(news.authorId, authorId), eq(news.isActive, true)),
          with: {
            author: {
              with: {
                user: true,
              },
            },
          },
          orderBy: [desc(news.createdAt)],
        });

        return authorNews;
      },
      { ttl: this.CACHE_TTL.AUTHOR_NEWS },
    );
  }

  // Cache warming utility - preload frequently accessed news data
  static async warmCache(orgId: string, authorId?: string) {
    try {
      // Warm up organization news cache
      await db.query.news
        .findMany({
          where: and(eq(news.organizationId, orgId), eq(news.isActive, true)),
          with: {
            author: {
              with: {
                user: true,
              },
            },
          },
          orderBy: [desc(news.createdAt)],
        })
        .then((newsArticles) => {
          const cacheKey = this.CACHE_KEYS.ORG_NEWS(orgId);
          return cache(cacheKey, async () => newsArticles, {
            ttl: this.CACHE_TTL.NEWS_LIST,
          });
        });

      // Warm news count
      await this.getNewsCount(orgId);

      // Warm author news if authorId is provided
      if (authorId) {
        await this.getNewsByAuthor(authorId);
      }

      console.log(`News cache warmed for organization: ${orgId}`);
    } catch (error) {
      console.error("Failed to warm news cache:", error);
      // Don't throw error for cache warming failures
    }
  }

  // Cache debugging utility - get news cache information
  static async getCacheInfo(orgId: string, authorId?: string) {
    const cacheKeys = [
      this.CACHE_KEYS.ORG_NEWS(orgId),
      this.CACHE_KEYS.NEWS_COUNT(orgId),
      this.CACHE_KEYS.ORG_NEWS_PATTERN(orgId),
    ];

    if (authorId) {
      cacheKeys.push(
        this.CACHE_KEYS.AUTHOR_NEWS(authorId),
        this.CACHE_KEYS.AUTHOR_NEWS_PATTERN(authorId),
      );
    }

    // This is a basic implementation - in production you might want to check Redis directly
    return {
      organizationId: orgId,
      authorId,
      cacheKeyPatterns: cacheKeys,
      timestamp: new Date().toISOString(),
    };
  }
}
