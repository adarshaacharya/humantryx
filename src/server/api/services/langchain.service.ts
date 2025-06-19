import { TRPCError } from "@trpc/server";
import { PPTXLoader } from "@langchain/community/document_loaders/fs/pptx";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { type Document } from "@langchain/core/documents";
import { initPinecone } from "@/lib/server/pinecone";
import { env } from "@/env";
import { getOpenAIEmbeddings, groqModel } from "@/lib/server/ai-models";
import cuid2 from "@paralleldrive/cuid2";
import { PineconeStore } from "@langchain/pinecone";
import { LangChainAdapter } from "ai";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { type Message as VercelChatMessage } from "ai";
import { z } from "zod";
import AIPrompts from "@/server/ai/prompts";
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
import { AIMessage, HumanMessage } from "@langchain/core/messages";

export class LangchainService {
  static textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1536,
    chunkOverlap: 100,
  });

  // load + split documents
  public static async ingestPDF(blob: Blob) {
    const loader = new PDFLoader(blob);

    const docs = await loader.load();

    return this.textSplitter.splitDocuments(docs);
  }

  public static async ingestPPTX(blob: Blob) {
    const loader = new PPTXLoader(blob);

    const docs = await loader.load();

    return this.textSplitter.splitDocuments(docs);
  }

  public static async ingestDOCX(blob: Blob) {
    const loader = new DocxLoader(blob);

    const docs = await loader.load();

    return this.textSplitter.splitDocuments(docs);
  }

  static async ingestFile(fileUrl: string) {
    const response = await fetch(fileUrl);

    if (!response.ok) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Document not found at the provided file URL.",
      });
    }

    const supportedFileExtensions = [".pdf", ".pptx", ".docx"];
    const fileExtension = fileUrl.split(".").pop()?.toLowerCase();

    if (!supportedFileExtensions.includes(`.${fileExtension}`)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Unsupported file type. Only PDF, PPTX, and DOCX are allowed.",
      });
    }

    const arrayBuffer = await response.arrayBuffer();

    // TODO: we need mime type detection for better handling, create separate table to store file metadata
    const blob = new Blob([arrayBuffer], { type: "application/pdf" });

    const splittedDocs: Document[] = [];

    switch (fileExtension) {
      case "pdf":
        splittedDocs.push(...(await this.ingestPDF(blob)));
        break;
      case "pptx":
        splittedDocs.push(...(await this.ingestPPTX(blob)));
        break;
      case "docx":
        splittedDocs.push(...(await this.ingestDOCX(blob)));
        break;
    }

    // fuel with metadata
    const castedSplits = splittedDocs.map((doc) => {
      return {
        pageContent: doc.pageContent,
        metadata: {
          ...doc.metadata,
          id: cuid2.createId(),
          createdAt: new Date(),
          fileName: fileUrl.split("/").pop() || "unknown",
          source: fileUrl,
          fileType: fileExtension,
        },
      };
    });

    const docs = await this.embedFile(castedSplits);

    return docs;
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

    console.log("Documents embedded successfully:", documents.length);

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

  static async chat({
    question,
    chatHistory = [],
  }: {
    question: string;
    chatHistory: VercelChatMessage[];
  }) {
    const retriever = await this.retrieveDocumentChunks();

    // make aware of chat history in case of follow-up questions
    const contextualizeQPrompt = ChatPromptTemplate.fromMessages([
      ["system", AIPrompts.contextualizeQSystemPrompt],
      new MessagesPlaceholder("chat_history"),
      ["user", "{input}"],
    ]);

    const historyAwareRetriever = await createHistoryAwareRetriever({
      llm: groqModel,
      retriever,
      rephrasePrompt: contextualizeQPrompt,
    });

    const qaPrompt = ChatPromptTemplate.fromMessages([
      ["system", AIPrompts.getDocumentInfoPrompt],
      new MessagesPlaceholder("chat_history"),
      ["user", "{input}"],
    ]);

    const questionAnswerChain = await createStuffDocumentsChain({
      llm: groqModel,
      prompt: qaPrompt,
    });

    const ragChain = await createRetrievalChain({
      retriever: historyAwareRetriever,
      combineDocsChain: questionAnswerChain,
    });

    const invokedChain = await ragChain.invoke({
      input: question,
      chat_history: this.convertToLangChainMessage(chatHistory),
    });

    const response = await questionAnswerChain.stream({
      input: invokedChain,
      chat_history: this.convertToLangChainMessage(chatHistory),
    });

    return LangChainAdapter.toDataStreamResponse(response);
  }

  static convertToLangChainMessage(messages: VercelChatMessage[]): AIMessage[] {
    return messages.map((msg) => {
      if (msg.role === "user") {
        return new HumanMessage(msg.content);
      } else {
        return new AIMessage(msg.content);
      }
    });
  }
}
