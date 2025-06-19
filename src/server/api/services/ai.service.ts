import { groqModel } from "@/lib/server/ai-models";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createLeaveRequestSchema } from "@/modules/leaves/schemas";
import { TRPCError } from "@trpc/server";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { z } from "zod";
import { db } from "@/server/db";
import { eq } from "drizzle-orm";
import { jobPostings } from "@/server/db/recruitment";
import AIPrompts from "@/server/ai/prompts";

export class AIService {
  static async generateLeaveRequest({ text }: { text: string }) {
    const systemTemplate = AIPrompts.generateLeaveRequestPrompt;

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", systemTemplate],
      ["human", "{text}"],
    ]);

    const structuredLlm = groqModel.withStructuredOutput(
      createLeaveRequestSchema,
      {
        name: "createLeaveRequest",
      },
    );

    const chain = prompt.pipe(structuredLlm);

    const output = await chain.invoke({
      text: text,
    });

    if (!createLeaveRequestSchema.safeParse(output).success) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message:
          "Invalid leave request format. Please try again or provide more info.",
      });
    }

    return output;
  }

  static async screenResume({
    resumeUrl,
    jobId,
  }: {
    resumeUrl: string;
    jobId: string;
  }) {
    const job = await db.query.jobPostings.findFirst({
      where: eq(jobPostings.id, jobId),
    });

    if (!job) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Job posting not found.",
      });
    }

    const response = await fetch(resumeUrl);

    if (!response.ok) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Resume not found at the provided URL.",
      });
    }

    const arrayBuffer = await response.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: "application/pdf" });

    const loader = new WebPDFLoader(blob);
    const documents = await loader.load();

    if (documents.length === 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No documents found at the provided URL.",
      });
    }

    const content = documents.map((doc) => doc.pageContent).join("\n");

    const systemTemplate = AIPrompts.screenResumePrompt;

    const comparisonPrompt = ChatPromptTemplate.fromMessages([
      ["system", systemTemplate],
      ["human", "Resume: {resume}\n\nJob: {job}"],
    ]);

    const structuredScreeningLlm = groqModel.withStructuredOutput(
      z.object({
        matchScore: z.number().min(0).max(100).describe("Percentage match of the resume with the job description. Higher the score, better the match."),
        confidence: z.number().min(0).max(100).describe("Confidence level in the match score between 1-100. Higher the confidence, more reliable the match."),
        matchedSkills: z.array(z.string()).describe("List of skills from the resume that match the job requirements."),
        missingSkills: z.array(z.string()).describe("List of skills from the job requirements that are missing in the resume."),
        recommendation: z.enum(["shortlist", "reject"]).describe("Recommendation for the resume based on the job requirements."),
        reasoning: z.string().describe("Reasoning behind the recommendation."),
      }),
      {
        name: "screenResumeMatch",
      },
    );

    const screeningChain = comparisonPrompt.pipe(structuredScreeningLlm);

    const screeningOutput = await screeningChain.invoke({
      resume: content,
      job: `${job.title}\n${job.description}`,
    });

    console.log("Screened Resume Output:", screeningOutput);

    return screeningOutput;
  }
}
