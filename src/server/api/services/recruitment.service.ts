import { TRPCError } from "@trpc/server";
import {
  and,
  eq,
  desc,
  ilike,
  or,
  count,
  sql,
  isNull,
  isNotNull,
} from "drizzle-orm";
import { db } from "@/server/db";
import {
  jobPostings,
  jobApplications,
  aiScreeningResults,
} from "@/server/db/recruitment";
import { employees } from "@/server/db/employees";
import { users } from "@/server/db/schema";

export type JobStatus = "open" | "closed" | "draft";
export type JobLocationType = "remote" | "onsite" | "hybrid";
export type ApplicationStatus =
  | "applied"
  | "shortlisted"
  | "interviewed"
  | "hired"
  | "rejected";
export type AIRecommendation = "shortlist" | "reject";

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

export interface CreateAIScreeningResultInput {
  jobApplicationId: string;
  organizationId: string;
  matchScore: number;
  confidence: number;
  recommendation: AIRecommendation;
  matchedSkills: string[];
  missingSkills: string[];
  summary: string;
  aiModel?: string;
  processingTime?: number;
  screenedByEmployeeId?: string;
}

export class RecruitmentService {
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
      .leftJoin(employees, eq(jobPostings.createdByEmployeeId, employees.id))
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
  }

  static async listJobPostings(params: JobListParams) {
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
      .leftJoin(employees, eq(jobPostings.createdByEmployeeId, employees.id))
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

      return application;
    } catch (error) {
      console.error("Error creating job application:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create job application",
      });
    }
  }

  static async getJobApplications(params: {
    jobPostingId: string;
    organizationId: string;
    status?: "all" | "pending" | "screened";
  }) {
    const { jobPostingId, organizationId, status = "all" } = params;

    // Build base conditions
    let conditions = and(
      eq(jobApplications.jobPostingId, jobPostingId),
      eq(jobApplications.organizationId, organizationId),
    );

    // Add status-specific conditions
    if (status === "pending") {
      // Has resume but no AI screening result
      conditions = and(
        conditions,
        isNotNull(jobApplications.resumeUrl),
        isNull(aiScreeningResults.id),
      );
    } else if (status === "screened") {
      // Has AI screening result
      conditions = and(conditions, isNotNull(aiScreeningResults.id));
    }

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
        aiScreeningResult: {
          id: aiScreeningResults.id,
          matchScore: aiScreeningResults.matchScore,
          confidence: aiScreeningResults.confidence,
          recommendation: aiScreeningResults.recommendation,
          matchedSkills: aiScreeningResults.matchedSkills,
          missingSkills: aiScreeningResults.missingSkills,
          summary: aiScreeningResults.summary,
          screenedAt: aiScreeningResults.screenedAt,
        },
      })
      .from(jobApplications)
      .leftJoin(
        employees,
        eq(jobApplications.reviewedByEmployeeId, employees.id),
      )
      .leftJoin(users, eq(employees.userId, users.id))
      .leftJoin(
        aiScreeningResults,
        eq(aiScreeningResults.jobApplicationId, jobApplications.id),
      )
      .where(conditions)
      .orderBy(desc(jobApplications.appliedAt));
  }

  static async getJobApplicationCounts(params: {
    jobPostingId: string;
    organizationId: string;
  }) {
    const { jobPostingId, organizationId } = params;

    // Get total count
    const totalResult = await db
      .select({ count: count() })
      .from(jobApplications)
      .where(
        and(
          eq(jobApplications.jobPostingId, jobPostingId),
          eq(jobApplications.organizationId, organizationId),
        ),
      );

    // Get pending count (has resume but no AI screening)
    const pendingResult = await db
      .select({ count: count() })
      .from(jobApplications)
      .leftJoin(
        aiScreeningResults,
        eq(aiScreeningResults.jobApplicationId, jobApplications.id),
      )
      .where(
        and(
          eq(jobApplications.jobPostingId, jobPostingId),
          eq(jobApplications.organizationId, organizationId),
          isNotNull(jobApplications.resumeUrl),
          isNull(aiScreeningResults.id),
        ),
      );

    // Get screened count (has AI screening result)
    const screenedResult = await db
      .select({ count: count() })
      .from(jobApplications)
      .leftJoin(
        aiScreeningResults,
        eq(aiScreeningResults.jobApplicationId, jobApplications.id),
      )
      .where(
        and(
          eq(jobApplications.jobPostingId, jobPostingId),
          eq(jobApplications.organizationId, organizationId),
          isNotNull(aiScreeningResults.id),
        ),
      );

    return {
      all: totalResult[0]?.count ?? 0,
      pending: pendingResult[0]?.count ?? 0,
      screened: screenedResult[0]?.count ?? 0,
    };
  }

  static async createAIScreeningResult(input: CreateAIScreeningResultInput) {
    try {
      const result = await db
        .insert(aiScreeningResults)
        .values({
          jobApplicationId: input.jobApplicationId,
          organizationId: input.organizationId,
          matchScore: input.matchScore,
          confidence: input.confidence,
          recommendation: input.recommendation,
          matchedSkills: input.matchedSkills,
          missingSkills: input.missingSkills,
          summary: input.summary,
          aiModel: input.aiModel,
          processingTime: input.processingTime,
          screenedByEmployeeId: input.screenedByEmployeeId,
        })
        .returning();

      const screeningResult = result[0];
      if (!screeningResult) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create AI screening result",
        });
      }

      return screeningResult;
    } catch (error) {
      console.error("Error creating AI screening result:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create AI screening result",
      });
    }
  }

  static async getAIScreeningResult(jobApplicationId: string) {
    const result = await db
      .select({
        id: aiScreeningResults.id,
        matchScore: aiScreeningResults.matchScore,
        confidence: aiScreeningResults.confidence,
        recommendation: aiScreeningResults.recommendation,
        matchedSkills: aiScreeningResults.matchedSkills,
        missingSkills: aiScreeningResults.missingSkills,
        summary: aiScreeningResults.summary,
        aiModel: aiScreeningResults.aiModel,
        processingTime: aiScreeningResults.processingTime,
        screenedAt: aiScreeningResults.screenedAt,
        screenedByEmployee: {
          id: employees.id,
          name: users.name,
        },
      })
      .from(aiScreeningResults)
      .leftJoin(
        employees,
        eq(aiScreeningResults.screenedByEmployeeId, employees.id),
      )
      .leftJoin(users, eq(employees.userId, users.id))
      .where(eq(aiScreeningResults.jobApplicationId, jobApplicationId))
      .orderBy(desc(aiScreeningResults.screenedAt))
      .limit(1);

    return result[0] || null;
  }

  static async getJobPostingByOrgAndJobId(
    organizationId: string,
    jobId: string,
  ) {
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
      .leftJoin(employees, eq(jobPostings.createdByEmployeeId, employees.id))
      .leftJoin(users, eq(employees.userId, users.id))
      .where(
        and(
          eq(jobPostings.id, jobId),
          eq(jobPostings.organizationId, organizationId),
          eq(jobPostings.status, "open"), // Only return open job postings for public access
          eq(jobPostings.isActive, true),
        ),
      )
      .limit(1);

    if (result.length === 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Job posting not found or not available",
      });
    }

    return result[0]!;
  }
}
