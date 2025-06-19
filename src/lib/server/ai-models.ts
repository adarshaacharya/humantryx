import { env } from "@/env";
import { ChatGroq } from "@langchain/groq";
import { OpenAIEmbeddings } from "@langchain/openai";

export const groqModel = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0,
});

export const getOpenAIEmbeddings = () =>
  new OpenAIEmbeddings({
    model: "text-embedding-3-small",
    openAIApiKey: env.OPENAI_API_KEY,
  });
