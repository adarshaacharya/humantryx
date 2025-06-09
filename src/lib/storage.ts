import { env } from "@/env";
import axios from "axios";

export const generateR2Url = (path?: string | null) => {
  if (!path) {
    return;
  }

  if (path?.startsWith("https:")) {
    return path;
  }

  return `${env.NEXT_PUBLIC_R2_ENDPOINT_URL}/${env.NEXT_PUBLIC_R2_BUCKET_NAME}/${path}`;
};

/**
 * This helper function takes the presigned url and fields provided by the AWS SDK, alongside
 * the file to be uploaded, and uploads it to the S3 bucket.
 */
export async function uploadFileToS3({
  presignedUrl,
  file,
}: {
  presignedUrl: string;
  file: File;
}) {
  try {
    const result = await axios.put(presignedUrl, file, {
      headers: {
        "Content-Type": file.type,
      },
    });
    return result;
  } catch (error) {
    console.error(error);
    return undefined;
  }
}
