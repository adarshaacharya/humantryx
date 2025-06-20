import { db } from "@/server/db";
import { attachments } from "@/server/db/attachments";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";

export class AttachmentService {
  static async getAttachmentById(id: string) {
    const [attachment] = await db
      .select()
      .from(attachments)
      .where(eq(attachments.id, id))
      .execute();

    if (!attachment) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Attachment not found",
      });
    }

    return attachment;
  }
}
