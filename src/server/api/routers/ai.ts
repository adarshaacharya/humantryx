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
});
