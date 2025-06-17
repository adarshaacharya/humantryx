import { TRPCError } from "@trpc/server";
import { and, eq, desc, ilike, or, count, sql } from "drizzle-orm";
import { db } from "@/server/db";
import { jobPostings, jobApplications } from "@/server/db/recruitment";
import { employees } from "@/server/db/employees";
import { users } from "@/server/db/schema";
import { cache, invalidateCache, invalidatePattern } from "@/lib/redis";

export type JobStatus = "open" | "closed" | "draft";
export type JobLocationType = "remote" | "onsite" | "hybrid";
export type ApplicationStatus =
  | "applied"
  | "shortlisted"
  | "interviewed"
  | "hired"
  | "rejected";

export interface CreateJobPostingInput {
  title: string;
  department: string;
  description: string;
  locationType: JobLocationType;
  location?: string;
  salaryRangeMin?: number;
  salaryRangeMax?: number;
  salaryCurrency?: string;
  experienceRequired?: string;
  skills?: string[];
  requirements?: string;
}

export interface UpdateJobPostingInput extends Partial<CreateJobPostingInput> {
  id: string;
  status?: JobStatus;
}

export interface JobListParams {
  organizationId: string;
  status?: JobStatus;
  department?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export class RecruitmentService {
  private static readonly CACHE_KEYS = {
    JOB_BY_ID: (jobId: string) => `hrms:v1:job:${jobId}`,
    ORG_JOBS: (orgId: string, params: string) =>
      `hrms:v1:org:${orgId}:jobs:${params}`,
    JOB_APPLICATIONS: (jobId: string) => `hrms:v1:job:${jobId}:applications`,
    JOB_STATS: (orgId: string) => `hrms:v1:org:${orgId}:job-stats`,
    ORG_JOBS_PATTERN: (orgId: string) => `hrms:v1:org:${orgId}:jobs:*`,
  } as const;

  private static readonly CACHE_TTL = {
    JOB_DETAIL: { ttl: 1800 }, // 30 minutes
    JOB_LIST: { ttl: 600 }, // 10 minutes
    JOB_STATS: { ttl: 3600 }, // 1 hour
  } as const;

  static async createJobPosting(
    input: CreateJobPostingInput & {
      organizationId: string;
      createdByEmployeeId: string;
    },
  ) {
    try {
      const result = await db
        .insert(jobPostings)
        .values({
          ...input,
          skills: input.skills || [],
        })
        .returning();

      const jobPosting = result[0];
      if (!jobPosting) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create job posting",
        });
      }

      // Invalidate related caches
      await invalidatePattern(
        this.CACHE_KEYS.ORG_JOBS_PATTERN(input.organizationId),
      );
      await invalidateCache(this.CACHE_KEYS.JOB_STATS(input.organizationId));

      return jobPosting;
    } catch (error) {
      console.error("Error creating job posting:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create job posting",
      });
    }
  }

  static async getJobPostingById(id: string) {
    return cache(
      this.CACHE_KEYS.JOB_BY_ID(id),
      async () => {
        const result = await db
          .select({
            id: jobPostings.id,
            organizationId: jobPostings.organizationId,
            title: jobPostings.title,
            department: jobPostings.department,
            description: jobPostings.description,
            locationType: jobPostings.locationType,
            location: jobPostings.location,
            status: jobPostings.status,
            salaryRangeMin: jobPostings.salaryRangeMin,
            salaryRangeMax: jobPostings.salaryRangeMax,
            salaryCurrency: jobPostings.salaryCurrency,
            experienceRequired: jobPostings.experienceRequired,
            skills: jobPostings.skills,
            requirements: jobPostings.requirements,
            isActive: jobPostings.isActive,
            createdAt: jobPostings.createdAt,
            updatedAt: jobPostings.updatedAt,
            publishedAt: jobPostings.publishedAt,
            closedAt: jobPostings.closedAt,
            createdByEmployee: {
              id: employees.id,
              name: users.name,
              email: users.email,
            },
          })
          .from(jobPostings)
          .leftJoin(
            employees,
            eq(jobPostings.createdByEmployeeId, employees.id),
          )
          .leftJoin(users, eq(employees.userId, users.id))
          .where(eq(jobPostings.id, id))
          .limit(1);

        if (result.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Job posting not found",
          });
        }

        return result[0]!;
      },
      this.CACHE_TTL.JOB_DETAIL,
    );
  }

  static async listJobPostings(params: JobListParams) {
    const cacheKey = this.CACHE_KEYS.ORG_JOBS(
      params.organizationId,
      JSON.stringify(params),
    );

    return cache(
      cacheKey,
      async () => {
        const {
          organizationId,
          status,
          department,
          search,
          limit = 10,
          offset = 0,
        } = params;

        // Build conditions array
        const conditions = [eq(jobPostings.organizationId, organizationId)];

        if (status) {
          conditions.push(eq(jobPostings.status, status));
        }

        if (department) {
          conditions.push(eq(jobPostings.department, department));
        }

        if (search) {
          conditions.push(
            or(
              ilike(jobPostings.title, `%${search}%`),
              ilike(jobPostings.description, `%${search}%`),
            )!,
          );
        }

        const jobs = await db
          .select({
            id: jobPostings.id,
            title: jobPostings.title,
            department: jobPostings.department,
            description: jobPostings.description,
            locationType: jobPostings.locationType,
            location: jobPostings.location,
            status: jobPostings.status,
            salaryRangeMin: jobPostings.salaryRangeMin,
            salaryRangeMax: jobPostings.salaryRangeMax,
            salaryCurrency: jobPostings.salaryCurrency,
            experienceRequired: jobPostings.experienceRequired,
            skills: jobPostings.skills,
            isActive: jobPostings.isActive,
            createdAt: jobPostings.createdAt,
            updatedAt: jobPostings.updatedAt,
            publishedAt: jobPostings.publishedAt,
            createdByEmployee: {
              id: employees.id,
              name: users.name,
            },
            applicationCount: sql<number>`(
              SELECT COUNT(*)::int 
              FROM ${jobApplications} 
              WHERE ${jobApplications.jobPostingId} = ${jobPostings.id}
            )`,
          })
          .from(jobPostings)
          .leftJoin(
            employees,
            eq(jobPostings.createdByEmployeeId, employees.id),
          )
          .leftJoin(users, eq(employees.userId, users.id))
          .where(and(...conditions))
          .orderBy(desc(jobPostings.createdAt))
          .limit(limit)
          .offset(offset);

        // Get total count
        const totalResult = await db
          .select({ count: count() })
          .from(jobPostings)
          .where(and(...conditions));

        const total = totalResult[0]?.count ?? 0;

        return {
          jobs,
          total,
          hasMore: offset + limit < total,
        };
      },
      this.CACHE_TTL.JOB_LIST,
    );
  }

  static async updateJobPosting(input: UpdateJobPostingInput) {
    try {
      const result = await db
        .update(jobPostings)
        .set({
          ...input,
          updatedAt: new Date(),
          ...(input.status === "open" && { publishedAt: new Date() }),
          ...(input.status === "closed" && { closedAt: new Date() }),
        })
        .where(eq(jobPostings.id, input.id))
        .returning();

      const jobPosting = result[0];
      if (!jobPosting) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Job posting not found",
        });
      }

      // Invalidate caches
      await invalidateCache(this.CACHE_KEYS.JOB_BY_ID(input.id));
      await invalidatePattern(
        this.CACHE_KEYS.ORG_JOBS_PATTERN(jobPosting.organizationId),
      );
      await invalidateCache(
        this.CACHE_KEYS.JOB_STATS(jobPosting.organizationId),
      );

      return jobPosting;
    } catch (error) {
      console.error("Error updating job posting:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to update job posting",
      });
    }
  }

  static async deleteJobPosting(id: string) {
    try {
      const result = await db
        .delete(jobPostings)
        .where(eq(jobPostings.id, id))
        .returning();

      const deletedJob = result[0];
      if (!deletedJob) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Job posting not found",
        });
      }

      // Invalidate caches
      await invalidateCache(this.CACHE_KEYS.JOB_BY_ID(id));
      await invalidatePattern(
        this.CACHE_KEYS.ORG_JOBS_PATTERN(deletedJob.organizationId),
      );
      await invalidateCache(
        this.CACHE_KEYS.JOB_STATS(deletedJob.organizationId),
      );

      return deletedJob;
    } catch (error) {
      console.error("Error deleting job posting:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to delete job posting",
      });
    }
  }

  static async getJobStatistics(organizationId: string) {
    return cache(
      this.CACHE_KEYS.JOB_STATS(organizationId),
      async () => {
        const stats = await db
          .select({
            status: jobPostings.status,
            count: count(),
          })
          .from(jobPostings)
          .where(eq(jobPostings.organizationId, organizationId))
          .groupBy(jobPostings.status);

        const totalApplications = await db
          .select({ count: count() })
          .from(jobApplications)
          .where(eq(jobApplications.organizationId, organizationId));

        return {
          jobsByStatus: stats,
          totalApplications: totalApplications[0]?.count ?? 0,
        };
      },
      this.CACHE_TTL.JOB_STATS,
    );
  }

  static async createJobApplication(input: {
    jobPostingId: string;
    organizationId: string;
    candidateName: string;
    candidateEmail: string;
    candidatePhone?: string | null;
    resumeUrl: string;
    coverLetter?: string | null;
  }) {
    try {
      const result = await db
        .insert(jobApplications)
        .values({
          jobPostingId: input.jobPostingId,
          organizationId: input.organizationId,
          candidateName: input.candidateName,
          candidateEmail: input.candidateEmail,
          candidatePhone: input.candidatePhone,
          resumeUrl: input.resumeUrl,
          coverLetter: input.coverLetter,
          status: "applied",
        })
        .returning();

      const application = result[0];
      if (!application) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create job application",
        });
      }

      // Invalidate related caches
      await invalidateCache(
        this.CACHE_KEYS.JOB_APPLICATIONS(input.jobPostingId),
      );
      await invalidateCache(this.CACHE_KEYS.JOB_STATS(input.organizationId));

      return application;
    } catch (error) {
      console.error("Error creating job application:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create job application",
      });
    }
  }

  static async getJobApplications(jobPostingId: string) {
    return cache(
      this.CACHE_KEYS.JOB_APPLICATIONS(jobPostingId),
      async () => {
        return db
          .select({
            id: jobApplications.id,
            candidateName: jobApplications.candidateName,
            candidateEmail: jobApplications.candidateEmail,
            candidatePhone: jobApplications.candidatePhone,
            resumeUrl: jobApplications.resumeUrl,
            coverLetter: jobApplications.coverLetter,
            status: jobApplications.status,
            appliedAt: jobApplications.appliedAt,
            reviewedAt: jobApplications.reviewedAt,
            interviewDate: jobApplications.interviewDate,
            reviewedByEmployee: {
              id: employees.id,
              name: users.name,
            },
          })
          .from(jobApplications)
          .leftJoin(
            employees,
            eq(jobApplications.reviewedByEmployeeId, employees.id),
          )
          .leftJoin(users, eq(employees.userId, users.id))
          .where(eq(jobApplications.jobPostingId, jobPostingId))
          .orderBy(desc(jobApplications.appliedAt));
      },
      this.CACHE_TTL.JOB_LIST,
    );
  }
}
