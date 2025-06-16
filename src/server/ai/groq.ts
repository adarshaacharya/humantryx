import { ChatGroq } from "@langchain/groq";

export const groqModel = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0,
});
