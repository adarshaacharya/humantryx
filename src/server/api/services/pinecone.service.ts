import { env } from "@/env";
import { getOpenAIEmbeddings } from "@/lib/server/ai-models";
import { initPinecone } from "@/lib/server/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { TRPCError } from "@trpc/server";
import { type Document } from "@langchain/core/documents";

export class PineconeService {
  static async removeDocument({ attachmentId }: { attachmentId: string }) {
    const pinecone = await initPinecone();

    return pinecone.index(env.PINECONE_INDEX).deleteMany({
      attachmentId: {
        $eq: attachmentId,
      },
    });
  }

  static async embedFile(documents: Document[]) {
    const pinecone = initPinecone();

    const openAIEmbeddings = getOpenAIEmbeddings();

    const pineconeIndex = (await pinecone).Index(env.PINECONE_INDEX);

    // todo: add namespace
    const vectorStore = await PineconeStore.fromDocuments(
      documents,
      openAIEmbeddings,
      {
        onFailedAttempt: (error) => {
          console.error("Failed to embed document:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to embed document",
          });
        },
        maxConcurrency: 10,
        pineconeIndex,
      },
    );

    console.log(`Successfully embedded ${documents.length} documents.`);

    return vectorStore;
  }

  static async retrieveDocumentChunks(topK = 5) {
    const pinecone = initPinecone();

    const openAIEmbeddings = getOpenAIEmbeddings();

    const pineconeIndex = (await pinecone).Index(env.PINECONE_INDEX);

    const vectorStore = await PineconeStore.fromExistingIndex(
      openAIEmbeddings,
      {
        pineconeIndex,
      },
    );

    const retriever = vectorStore.asRetriever(topK);

    return retriever;
  }
}
