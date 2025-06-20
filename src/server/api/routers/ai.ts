import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { LeaveService } from "../services/leave.service";
import { AIService } from "../services/ai.service";

export const aiRouter = createTRPCRouter({
  createLeaveRequest: protectedProcedure
    .input(
      z.object({
        text: z.string().min(1, "Text is required"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const output = await AIService.generateLeaveRequest({ text: input.text });
      return LeaveService.createLeaveRequest(output, ctx.session);
    }),

  screenResume: protectedProcedure
    .input(
      z.object({
        resumeUrl: z.string().url("Valid resume URL is required"),
        jobId: z.string().uuid("Valid job ID is required"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const output = await AIService.screenResume(input);
      return output;
    }),

  askDocs: protectedProcedure
    .input(
      z.object({
        question: z.string().min(1, "Question is required"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // const output = await AIService.askDocuments(input.question, ctx.session);
      // return output;
    }),
});
