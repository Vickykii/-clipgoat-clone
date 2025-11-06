import { Worker } from "bullmq";
import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";
import { env } from "@/env";
import { logger } from "@/utils/logger";
import { prisma } from "@/utils/db";
import { ingestProcessor } from "@/processors/ingest";
import { transcribeProcessor } from "@/processors/transcribe";
import { suggestProcessor } from "@/processors/suggest";
import { renderProcessor } from "@/processors/render";
import { publishProcessor } from "@/processors/publish";
import { QUEUE_NAMES } from "@clipforge/shared";

if (ffmpegStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic);
}

const connection = {
  connection: {
    url: env.REDIS_URL
  }
};

const workers = [
  new Worker(QUEUE_NAMES.ingest, ingestProcessor, { ...connection, concurrency: 2 }),
  new Worker(QUEUE_NAMES.transcribe, transcribeProcessor, { ...connection, concurrency: 2 }),
  new Worker(QUEUE_NAMES.suggest, suggestProcessor, { ...connection, concurrency: 1 }),
  new Worker(QUEUE_NAMES.render, renderProcessor, { ...connection, concurrency: 1 }),
  new Worker(QUEUE_NAMES.publish, publishProcessor, { ...connection, concurrency: 1 })
];

for (const worker of workers) {
  worker.on("completed", (job) => {
    logger.info({ jobId: job.id, name: job.name }, "Job completed");
  });
  worker.on("failed", (job, err) => {
    logger.error({ jobId: job?.id, name: job?.name, err }, "Job failed");
  });
}

logger.info("Worker service started");

process.on("SIGINT", async () => {
  logger.info("Shutting down worker");
  await Promise.all(workers.map((worker) => worker.close()));
  await prisma.$disconnect();
  process.exit(0);
});
