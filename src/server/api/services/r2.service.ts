import { env } from "@/env";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  type PutObjectCommandInput,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { TRPCError } from "@trpc/server";

export type FileObject = {
  Key?: string;
  LastModified?: Date;
  ETag?: string;
  Size?: number;
  StorageClass?: string;
};

export const PUT_ASSETS_EXPIRES_IN = 4 * 60;

/**
 * Generate a public URL for accessing uploaded photos
 * Uses React cache to memoize results and improve performance
 * @param filename - The name of the uploaded file
 * @param folder - The folder where the file is stored
 * @returns The complete public URL for accessing the file
 * @throws Error if CLOUDFLARE_R2_PUBLIC_URL is not configured
 */
const getPublicUrl = (filename: string) => {
  const publicUrl = env.NEXT_PUBLIC_R2_PUBLIC_URL;

  if (!publicUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "CLOUDFLARE_R2_PUBLIC_URL is not configured",
    });
  }
  return `${publicUrl}/${filename}`;
};

const client = new S3Client({
  region: "auto",
  endpoint: env.NEXT_PUBLIC_R2_ENDPOINT_URL,

  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true, // Required for R2 compatibility
  apiVersion: "2006-03-01",
});

const R2_BUCKET = env.NEXT_PUBLIC_R2_BUCKET_NAME;

export async function uploadFile(file: Buffer, key: string): Promise<string> {
  const params: PutObjectCommandInput = {
    Bucket: R2_BUCKET,
    Key: key,
    Body: file,
  };

  try {
    const command = new PutObjectCommand(params);
    await client.send(command);

    return `${env.NEXT_PUBLIC_R2_ENDPOINT_URL}/${key}`;
  } catch (error) {
    console.error("Error uploading file to R2:", error);
    throw error;
  }
}

export async function getSignedUrlForUpload({
  key,
  contentType,
}: {
  key: string;
  contentType: string;
}) {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    ContentType: contentType,
  });

  try {
    const signedUrl = await getSignedUrl(client, command, {
      expiresIn: PUT_ASSETS_EXPIRES_IN,
    });

    const publicUrl = getPublicUrl(key);

    return {
      uploadUrl: signedUrl,
      path: key,
      publicUrl,
    };
  } catch (error) {
    console.error("Error generating signed URL:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to generate signed URL for upload",
    });
  }
}

export async function getSignedUrlForDownload(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
  });

  try {
    const signedUrl = await getSignedUrl(client, command, { expiresIn: 3600 });
    return signedUrl;
  } catch (error) {
    console.error("Error generating signed URL:", error);
    throw error;
  }
}

export async function listFiles(prefix = ""): Promise<FileObject[]> {
  const command = new ListObjectsV2Command({
    Bucket: R2_BUCKET,
    Prefix: prefix,
  });

  try {
    const response = await client.send(command);
    return response.Contents ?? [];
  } catch (error) {
    console.error("Error listing files:", error);
    throw error;
  }
}

export async function deleteFile(key: string) {
  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
  });

  try {
    const response = await client.send(command);
    return response;
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
}
