import { z } from "zod";
import "dotenv/config";

const envSchema = z.object({
  DATABASE_URL: z.string(),
  REDIS_URL: z.string(),
  S3_ENDPOINT: z.string(),
  S3_REGION: z.string(),
  S3_BUCKET: z.string(),
  S3_ACCESS_KEY_ID: z.string(),
  S3_SECRET_ACCESS_KEY: z.string(),
  OPENAI_API_KEY: z.string(),
  ASSEMBLYAI_API_KEY: z.string().optional(),
  ENCRYPTION_KEY: z.string().min(32),
  APP_URL: z.string().optional()
});

export const env = envSchema.parse(process.env);
