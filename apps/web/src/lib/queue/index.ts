import { Queue } from "bullmq";
import { env } from "@/lib/env";
import { QUEUE_NAMES } from "@clipforge/shared";

const connection = {
  connection: {
    url: env.REDIS_URL
  }
};

export const ingestQueue = new Queue(QUEUE_NAMES.ingest, connection);
export const transcribeQueue = new Queue(QUEUE_NAMES.transcribe, connection);
export const suggestQueue = new Queue(QUEUE_NAMES.suggest, connection);
export const renderQueue = new Queue(QUEUE_NAMES.render, connection);
export const publishQueue = new Queue(QUEUE_NAMES.publish, connection);
