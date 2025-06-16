import { groqModel } from "@/server/ai/groq";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createLeaveRequestSchema } from "@/modules/leaves/schemas";
import { TRPCError } from "@trpc/server";

export class AIService {
  static async generateLeaveRequest({ text }: { text: string }) {
    const systemTemplate = `
         Create a leave request based on the following text: {text}. 
         If the text does not contain a valid leave request, throw an error asking for more information.
         If the text doesn't contains leave time duration or date, throw an error asking for the duration.
         Output start and end dates in ISO format (YYYY-MM-DD).
       `;

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
}
