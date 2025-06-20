import { env } from "@/env";
import { initPinecone } from "@/lib/server/pinecone";

export class PineconeService {
  static async removeDocument({ attachmentId }: { attachmentId: string }) {
    const pinecone = await initPinecone();

    return pinecone.index(env.PINECONE_INDEX).deleteMany({
      attachmentId: {
        $eq: attachmentId,
      },
    });
  }
}
