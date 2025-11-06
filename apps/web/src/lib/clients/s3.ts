import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "node:crypto";
import { env } from "@/lib/env";

export const s3 = new S3Client({
  region: env.S3_REGION,
  endpoint: env.S3_ENDPOINT,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY
  }
});

export async function createUploadUrl({
  fileName,
  fileType,
  fileSize
}: {
  fileName: string;
  fileType: string;
  fileSize: number;
}) {
  const key = `uploads/${crypto.randomUUID()}-${fileName}`;
  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: key,
    ContentType: fileType,
    ContentLength: fileSize
  });
  const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 * 10 });
  return { signedUrl, key };
}

export async function createDownloadUrl(key: string, expiresInSeconds = 60 * 5) {
  const command = new GetObjectCommand({ Bucket: env.S3_BUCKET, Key: key });
  return getSignedUrl(s3, command, { expiresIn: expiresInSeconds });
}
