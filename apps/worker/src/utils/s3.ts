import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { env } from "@/env";

export const s3 = new S3Client({
  region: env.S3_REGION,
  endpoint: env.S3_ENDPOINT,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY
  }
});

export async function uploadStream({ key, body, contentType }: { key: string; body: NodeJS.ReadableStream; contentType: string }) {
  const uploader = new Upload({
    client: s3,
    params: {
      Bucket: env.S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType
    }
  });
  await uploader.done();
  return key;
}

export async function downloadToFile(key: string, destination: NodeJS.WritableStream) {
  const command = new GetObjectCommand({ Bucket: env.S3_BUCKET, Key: key });
  const response = await s3.send(command);
  if (!response.Body) {
    throw new Error("S3 object body missing");
  }
  await new Promise<void>((resolve, reject) => {
    const stream = response.Body as NodeJS.ReadableStream;
    stream.pipe(destination);
    stream.on("error", reject);
    destination.on("error", reject);
    destination.on("finish", () => resolve());
  });
}
