import { z } from "zod";
import { getSignedUrlForUpload } from "../services/r2.service";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import cuid2 from "@paralleldrive/cuid2";

export const getFileExtension = (name: string) => {
  return name.split(".").at(-1) ?? "N/A";
};

export const attachmentsRouter = createTRPCRouter({
  getPresignedUrl: protectedProcedure
    .input(z.object({ fileName: z.string(), fileType: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const extension = getFileExtension(input.fileName);

      const id = cuid2.createId();
      const attachmentKey = `${id}${extension ? `.${extension}` : ""}`;

      const { uploadUrl, path, publicUrl } = await getSignedUrlForUpload({
        key: attachmentKey,
        contentType: input.fileType,
      });

      return { uploadUrl, path, publicUrl };
    }),
});
