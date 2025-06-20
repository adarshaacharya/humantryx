import { env } from "@/env";
import { Pinecone } from "@pinecone-database/pinecone";

export async function initPinecone() {
  try {
    const pinecone = new Pinecone({
      apiKey: env.PINECONE_API_KEY,
    });
    return pinecone;
  } catch (error) {
    console.error("Failed to initialize Pinecone:", error);
    throw new Error("Pinecone initialization failed");
  }
}
