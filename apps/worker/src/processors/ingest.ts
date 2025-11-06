import { Job } from "bullmq";
import { createReadStream, createWriteStream } from "node:fs";
import { stat } from "node:fs/promises";
import { tmpFile } from "@/utils/temp";
import { uploadStream, downloadToFile } from "@/utils/s3";
import { prisma } from "@/utils/db";
import { logger } from "@/utils/logger";
import ffmpeg from "fluent-ffmpeg";
import ytDlp from "yt-dlp-exec";

type IngestPayload = {
  projectId: string;
  sourceType: "youtube" | "upload";
  youtubeUrl?: string;
  uploadKey?: string;
};

async function probe(path: string) {
  return new Promise<{ duration?: number; width?: number; height?: number }>((resolve, reject) => {
    ffmpeg.ffprobe(path, (err, metadata) => {
      if (err) return reject(err);
      const stream = metadata.streams?.find((s) => s.codec_type === "video");
      resolve({
        duration: metadata.format?.duration,
        width: stream?.width,
        height: stream?.height
      });
    });
  });
}

export const ingestProcessor = async (job: Job<IngestPayload>) => {
  const { projectId, sourceType, youtubeUrl, uploadKey } = job.data;
  logger.info({ projectId }, "Ingest job received");

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    throw new Error("Project not found");
  }

  let filePath: string | null = null;
  let storageKey = uploadKey ?? null;

  if (sourceType === "youtube") {
    if (!youtubeUrl) throw new Error("YouTube URL required");
    filePath = await tmpFile({ postfix: ".mp4" });
    await ytDlp(youtubeUrl, {
      output: filePath,
      format: "mp4"
    });
    const readStream = createReadStream(filePath);
    const key = `assets/${projectId}.mp4`;
    await uploadStream({ key, body: readStream, contentType: "video/mp4" });
    storageKey = key;
  }

  if (!storageKey) {
    throw new Error("Storage key missing");
  }

  if (!filePath) {
    filePath = await tmpFile({ postfix: ".mp4" });
    const writer = createWriteStream(filePath);
    await downloadToFile(storageKey, writer);
  }

  const stats = await stat(filePath);
  const meta = await probe(filePath);

  const asset = await prisma.asset.create({
    data: {
      type: "video",
      storageKey,
      mimeType: "video/mp4",
      sizeBytes: Number(stats.size),
      width: meta.width ?? null,
      height: meta.height ?? null,
      durationMs: meta.duration ? Math.round(meta.duration * 1000) : null,
      meta: {
        sourceType
      }
    }
  });

  await prisma.project.update({
    where: { id: projectId },
    data: {
      assetId: asset.id,
      durationMs: asset.durationMs,
      ingestStatus: "completed",
      status: "processing"
    }
  });

  logger.info({ projectId }, "Ingest completed");
};
