import { TRPCError } from "@trpc/server";
import { PPTXLoader } from "@langchain/community/document_loaders/fs/pptx";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { type Document } from "@langchain/core/documents";
import { groqModel } from "@/lib/server/ai-models";
import cuid2 from "@paralleldrive/cuid2";
import { LangChainAdapter } from "ai";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { type Message as VercelChatMessage } from "ai";
import AIPrompts from "@/server/ai/prompts";
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { PineconeService } from "./pinecone.service";

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

  static convertToLangChainMessage(messages: VercelChatMessage[]): AIMessage[] {
    return messages.map((msg) => {
      if (msg.role === "user") {
        return new HumanMessage(msg.content);
      } else {
        return new AIMessage(msg.content);
      }
    });
  }

  static async ingestFile({
    fileUrl,
    attachmentId,
    fileName,
  }: {
    fileUrl: string;
    attachmentId: string;
    fileName?: string;
  }) {
    const response = await fetch(fileUrl);

    if (!response.ok) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Document not found at the provided file URL.",
      });
    }

    const supportedFileExtensions = [".pdf", ".pptx", ".docx", ".doc"];
    const fileExtension = fileUrl.split(".").pop()?.toLowerCase();

    if (!supportedFileExtensions.includes(`.${fileExtension}`)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message:
          "Unsupported file type. Only PDF, PPTX, DOCX, and DOC are allowed.",
      });
    }

    const arrayBuffer = await response.arrayBuffer();

    const mimeType = response.headers.get("content-type");

    if (!mimeType?.startsWith("application/")) {
      throw new TRPCError({
        code: "UNSUPPORTED_MEDIA_TYPE",
        message: "Unsupported file type. Only application/* types are allowed.",
      });
    }

    const blob = new Blob([arrayBuffer], { type: mimeType });

    const splittedDocs: Document[] = [];

    switch (fileExtension) {
      case "pdf":
        splittedDocs.push(...(await this.ingestPDF(blob)));
        break;
      case "pptx":
        splittedDocs.push(...(await this.ingestPPTX(blob)));
        break;
      case "docx":
      case "doc":
        splittedDocs.push(...(await this.ingestDOCX(blob)));
        break;
      default:
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Unsupported file type. Only PDF, PPTX, and DOCX are allowed.",
        });
    }

    // fuel with metadata
    const castedSplits = splittedDocs.map((doc) => {
      return {
        pageContent: doc.pageContent,
        metadata: {
          ...doc.metadata,
          docId: cuid2.createId(),
          attachmentId: attachmentId, // attachmentId acts bridge between our db and pinecone for crud operations
          fileName: fileName || fileUrl.split("/").pop(),
          source: fileUrl,
          fileType: fileExtension,
        },
      };
    });

    const docs = await PineconeService.embedFile(castedSplits);

    return docs;
  }

  static async chatDocs({
    question,
    chatHistory = [],
  }: {
    question: string;
    chatHistory: VercelChatMessage[];
  }) {
    const retriever = await PineconeService.retrieveDocumentChunks();

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
}
