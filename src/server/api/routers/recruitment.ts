import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { RecruitmentService } from "@/server/api/services/recruitment.service";
import {
  jobStatusEnum,
  jobLocationTypeEnum,
  aiRecommendationEnum,
} from "@/server/db/recruitment";

// Zod schemas for validation
const jobStatusSchema = z.enum(jobStatusEnum.enumValues);
const jobLocationTypeSchema = z.enum(jobLocationTypeEnum.enumValues);
const aiRecommendationSchema = z.enum(aiRecommendationEnum.enumValues);

const createJobPostingSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  department: z.string().min(1, "Department is required"),
  description: z
    .string()
    .min(1, "Description is required")
    .refine(
      (val) => {
        // For HTML content, check if it has meaningful content (not just empty tags)
        const textContent = val.replace(/<[^>]*>/g, "").trim();
        return textContent.length >= 10;
      },
      { message: "Description must be at least 10 characters" },
    ),
  locationType: jobLocationTypeSchema,
  location: z.string().optional(),
  salaryRangeMin: z.number().positive().optional(),
  salaryRangeMax: z.number().positive().optional(),
  salaryCurrency: z.string().default("USD"),
  experienceRequired: z.string().optional(),
  skills: z.array(z.string()).default([]),
  requirements: z.string().optional(),
  createdByEmployeeId: z.string().uuid(),
});

const updateJobPostingSchema = createJobPostingSchema.partial().extend({
  id: z.string().uuid(),
  status: jobStatusSchema.optional(),
});

const createApplicationSchema = z.object({
  jobPostingId: z.string().uuid(),
  candidateName: z.string().min(1, "Candidate name is required"),
  candidateEmail: z.string().email("Valid email is required"),
  candidatePhone: z.string().nullable().optional(),
  resumeUrl: z.string().url("Valid resume URL is required"),
  coverLetter: z.string().nullable().optional(),
});

const jobListParamsSchema = z.object({
  status: jobStatusSchema.optional(),
  department: z.string().optional(),
  search: z.string().optional(),
  limit: z.number().min(1).max(100).default(10),
  offset: z.number().min(0).default(0),
});

const createAIScreeningResultSchema = z.object({
  jobApplicationId: z.string().uuid(),
  matchScore: z.number().min(0).max(100),
  confidence: z.number().min(0).max(100),
  recommendation: aiRecommendationSchema,
  matchedSkills: z.array(z.string()).default([]),
  missingSkills: z.array(z.string()).default([]),
  summary: z.string().min(1, "Summary is required"),
  aiModel: z.string().optional(),
  processingTime: z.number().optional(),
  screenedByEmployeeId: z.string().uuid().optional(),
});

export const recruitmentRouter = createTRPCRouter({
  // Create a new job posting
  create: protectedProcedure
    .input(createJobPostingSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session.session.activeOrganizationId) {
        throw new Error("No active organization");
      }

      return RecruitmentService.createJobPosting({
        ...input,
        organizationId: ctx.session.session.activeOrganizationId,
        createdByEmployeeId: input.createdByEmployeeId,
      });
    }),

  // Get job posting by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      return RecruitmentService.getJobPostingById(input.id);
    }),

  // Get job posting by organization ID and job ID (public route for shareable URLs)
  getByOrgAndJobId: publicProcedure
    .input(
      z.object({
        organizationId: z.string(),
        jobId: z.string().uuid(),
      }),
    )
    .query(async ({ input }) => {
      return RecruitmentService.getJobPostingByOrgAndJobId(
        input.organizationId,
        input.jobId,
      );
    }),

  // List job postings
  list: protectedProcedure
    .input(jobListParamsSchema)
    .query(async ({ input, ctx }) => {
      if (!ctx.session.session.activeOrganizationId) {
        throw new Error("No active organization");
      }

      return RecruitmentService.listJobPostings({
        ...input,
        organizationId: ctx.session.session.activeOrganizationId,
      });
    }),

  // Update job posting
  update: protectedProcedure
    .input(updateJobPostingSchema)
    .mutation(async ({ input }) => {
      return RecruitmentService.updateJobPosting(input);
    }),

  // Delete job posting
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      return RecruitmentService.deleteJobPosting(input.id);
    }),

  // Get job statistics
  getStats: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session.session.activeOrganizationId) {
      throw new Error("No active organization");
    }

    return RecruitmentService.getJobStatistics(
      ctx.session.session.activeOrganizationId,
    );
  }),

  // Get job applications
  getApplications: protectedProcedure
    .input(
      z.object({
        jobId: z.string().uuid(),
        status: z
          .enum(["all", "pending", "screened"])
          .optional()
          .default("all"),
      }),
    )
    .query(async ({ input, ctx }) => {
      if (!ctx.session.session.activeOrganizationId) {
        throw new Error("No active organization");
      }

      return RecruitmentService.getJobApplications({
        jobPostingId: input.jobId,
        organizationId: ctx.session.session.activeOrganizationId,
        status: input.status,
      });
    }),

  // Get application counts for tabs
  getApplicationCounts: protectedProcedure
    .input(z.object({ jobId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.session.session.activeOrganizationId) {
        throw new Error("No active organization");
      }

      return RecruitmentService.getJobApplicationCounts({
        jobPostingId: input.jobId,
        organizationId: ctx.session.session.activeOrganizationId,
      });
    }),

  // Create job application (for manual resume uploads)
  createApplication: protectedProcedure
    .input(createApplicationSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session.session.activeOrganizationId) {
        throw new Error("No active organization");
      }

      return RecruitmentService.createJobApplication({
        ...input,
        organizationId: ctx.session.session.activeOrganizationId,
      });
    }),

  // Publish job (change status to open)
  publish: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      return RecruitmentService.updateJobPosting({
        id: input.id,
        status: "open",
      });
    }),

  // Close job (change status to closed)
  close: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      return RecruitmentService.updateJobPosting({
        id: input.id,
        status: "closed",
      });
    }),

  // Create AI screening result
  createScreeningResult: protectedProcedure
    .input(createAIScreeningResultSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session.session.activeOrganizationId) {
        throw new Error("No active organization");
      }

      return RecruitmentService.createAIScreeningResult({
        ...input,
        organizationId: ctx.session.session.activeOrganizationId,
      });
    }),

  // Get AI screening result for an application
  getScreeningResult: protectedProcedure
    .input(z.object({ jobApplicationId: z.string().uuid() }))
    .query(async ({ input }) => {
      return RecruitmentService.getAIScreeningResult(input.jobApplicationId);
    }),
});
