import { z } from "zod";
import { jobStatusEnum, jobLocationTypeEnum } from "@/server/db/recruitment";

export const jobFormSchema = z.object({
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
  locationType: z.enum(jobLocationTypeEnum.enumValues),
  location: z.string().optional(),
  salaryRangeMin: z.coerce.number().positive().optional(),
  salaryRangeMax: z.coerce.number().positive().optional(),
  salaryCurrency: z.string().default("USD"),
  experienceRequired: z.string().optional(),
  skills: z.array(z.string()).default([]),
  requirements: z.string().optional(),
  status: z.enum(jobStatusEnum.enumValues).default("draft"),
});

export type JobFormData = z.infer<typeof jobFormSchema>;
