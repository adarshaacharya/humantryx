import { z } from "zod";
import { getSignedUrlForUpload } from "../services/r2.service";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import cuid2 from "@paralleldrive/cuid2";
import { attachments } from "@/server/db/attachments";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { AttachmentService } from "../services/attachment.service";

export const getFileExtension = (name: string) => {
  return name.split(".").at(-1) ?? "N/A";
};

export const attachmentsRouter = createTRPCRouter({
  getPresignedUrl: protectedProcedure
    .input(
      z.object({
        fileName: z.string(),
        mimeType: z.string(),
        type: z.enum(["image", "video", "audio", "document"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const extension = getFileExtension(input.fileName);

      const id = cuid2.createId();
      const attachmentKey = `${id}${extension ? `.${extension}` : ""}`;

      const { uploadUrl, path, publicUrl } = await getSignedUrlForUpload({
        key: attachmentKey,
        contentType: input.mimeType,
      });

      const [attachment] = await ctx.db
        .insert(attachments)
        .values({
          fullPath: publicUrl, // TODO: currently using public URL as full path since there is some issue with presigned url
          mimeType: input.mimeType,
          userId: ctx.session.user.id,
          extension,
          fileName: input.fileName,
          type: input.type,
        })
        .returning()
        .execute();

      if (!attachment) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create attachment record",
        });
      }

      return { uploadUrl, path, publicUrl, attachmentId: attachment.id };
    }),

  getAttachment: protectedProcedure
    .input(z.object({ attachmentId: z.string() }))
    .query(async ({ ctx, input }) => {
      return AttachmentService.getAttachmentById(input.attachmentId);
    }),
});
