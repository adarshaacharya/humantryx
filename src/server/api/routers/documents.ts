import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { DocumentsService } from "@/server/api/services/document.service";
import {
  createDocumentSchema,
  updateDocumentSchema,
  documentFiltersSchema,
} from "@/modules/documents/schemas";
import { TRPCError } from "@trpc/server";
import { accessControl } from "../middleware/casl-middleware";
import { LangchainService } from "../services/langchain.service";
import { PineconeService } from "../services/pinecone.service";

export const documentsRouter = createTRPCRouter({
  // Create a new document
  create: protectedProcedure
    .input(createDocumentSchema)
    .use(
      accessControl(async (option, ability) => {
        return ability.can("create", "Documents");
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { document, attachment } = await DocumentsService.create({
        ...input,
        uploadedBy: ctx.session.user.id,
      });

      // saving to pinecone db + attachmentId acts bridge between our db and pinecone
      await LangchainService.ingestFile({
        fileUrl: attachment?.fullPath,
        attachmentId: attachment.id,
        fileName: attachment.fileName,
      });

      return document;
    }),

  // Update an existing document
  update: protectedProcedure
    .input(updateDocumentSchema)
    .use(
      accessControl(async (option, ability) => {
        return ability.can("update", "Documents");
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Get existing document to check ownership
      const existingDocument = await DocumentsService.findById(input.id);
      if (!existingDocument) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Document not found",
        });
      }

      // Check if user can update this specific document
      if (
        existingDocument.uploadedBy !== ctx.session.user.id &&
        !ctx.ability.can("manage", "Documents")
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only update documents you uploaded",
        });
      }

      return await DocumentsService.update(input);
    }),

  // Get documents list with filters
  list: protectedProcedure
    .input(documentFiltersSchema)
    .use(
      accessControl(async (option, ability) => {
        return ability.can("read", "Documents");
      }),
    )
    .query(async ({ input, ctx }) => {
      // If user is not HR, they can't see HR-only documents
      if (!ctx.ability.can("manage", "Documents")) {
        // Regular employees can see "all" and "employees" visibility
        if (input.visibility === "hr") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to view HR documents",
          });
        }
      }

      return await DocumentsService.findMany(input);
    }),

  // Get a specific document by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .use(
      accessControl(async (option, ability) => {
        return ability.can("read", "Documents");
      }),
    )
    .query(async ({ input, ctx }) => {
      const document = await DocumentsService.findById(input.id);
      if (!document) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Document not found",
        });
      }

      // Check visibility permissions
      if (
        document.visibility === "hr" &&
        !ctx.ability.can("manage", "Documents")
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to view this document",
        });
      }

      return document;
    }),

  // Delete a document (soft delete)
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .use(
      accessControl(async (option, ability) => {
        return ability.can("delete", "Documents");
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Get existing document to check ownership
      const existingDocument = await DocumentsService.findById(input.id);
      if (!existingDocument) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Document not found",
        });
      }

      // Check if user has permission to delete documents
      const canDeleteAll = ctx.ability.can("manage", "Documents");
      const isOwner = existingDocument.uploadedBy === ctx.session.user.id;

      if (!canDeleteAll && !isOwner) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only delete documents you uploaded",
        });
      }

      const document = await DocumentsService.delete(input.id);

      await PineconeService.removeDocument({
        attachmentId: document.attachmentId,
      });
    }),

  // Get document statistics
  getStats: protectedProcedure
    .use(
      accessControl(async (option, ability) => {
        return ability.can("read", "Documents");
      }),
    )
    .query(async () => {
      return await DocumentsService.getStats();
    }),
});
