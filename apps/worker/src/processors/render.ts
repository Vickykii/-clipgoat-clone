import { Job } from "bullmq";
import { createWriteStream, createReadStream, promises as fs } from "node:fs";
import ffmpeg from "fluent-ffmpeg";
import { prisma } from "@/utils/db";
import { logger } from "@/utils/logger";
import { uploadStream, downloadToFile } from "@/utils/s3";
import { millisToTimestamp } from "@clipforge/shared";
import { tmpFile, tmpDir } from "@/utils/temp";

type RenderPayload = {
  clipId: string;
  force?: boolean;
};

function aspectToSize(aspect: string) {
  switch (aspect) {
    case "16:9":
      return { width: 1920, height: 1080 };
    case "1:1":
      return { width: 1080, height: 1080 };
    default:
      return { width: 1080, height: 1920 };
  }
}

function wordsToSrt(words: Array<{ text: string; startMs: number; endMs: number }>) {
  if (!words.length) return "";
  const chunks: typeof words[] = [];
  let current: typeof words = [];
  for (const word of words) {
    current.push(word);
    if (current.length >= 8) {
      chunks.push(current);
      current = [];
    }
  }
  if (current.length) chunks.push(current);

  return chunks
    .map((chunk, index) => {
      const start = chunk[0];
      const end = chunk[chunk.length - 1];
      const startTime = millisToTimestamp(start.startMs);
      const endTime = millisToTimestamp(end.endMs);
      return `${index + 1}\n${startTime} --> ${endTime}\n${chunk.map((w) => w.text).join(" ")}\n`;
    })
    .join("\n");
}

export const renderProcessor = async (job: Job<RenderPayload>) => {
  const { clipId } = job.data;
  logger.info({ clipId }, "Render job received");

  const clip = await prisma.clip.findUnique({
    where: { id: clipId },
    include: {
      project: {
        include: {
          asset: true,
          workspace: true,
          transcription: true
        }
      },
      segment: true
    }
  });

  if (!clip || !clip.project.asset || !clip.segment) {
    throw new Error("Clip prerequisites missing");
  }

  await prisma.clip.update({ where: { id: clipId }, data: { status: "processing" } });

  const renderJobRecord = await prisma.renderJob.create({
    data: {
      clipId,
      jobType: "render",
      status: "processing",
      attempts: job.attemptsMade,
      queuedAt: job.timestamp ? new Date(job.timestamp) : new Date(),
      startedAt: new Date()
    }
  });

  try {
    const inputPath = await tmpFile({ postfix: ".mp4" });
    const inputWriter = createWriteStream(inputPath);
    await downloadToFile(clip.project.asset.storageKey, inputWriter);

    const { width, height } = aspectToSize(clip.aspectRatio);
    const srtContent = wordsToSrt((clip.project.transcription?.words as any[]) ?? []);
    const srtPath = await tmpFile({ postfix: ".srt" });
    await fs.writeFile(srtPath, srtContent, "utf8");

    const outputPath = await tmpFile({ postfix: ".mp4" });
    const startSeconds = clip.segment.startMs / 1000;
    const durationSeconds = (clip.segment.endMs - clip.segment.startMs) / 1000;

    await new Promise<void>((resolve, reject) => {
      ffmpeg(inputPath)
        .setStartTime(startSeconds)
        .duration(durationSeconds)
        .size(`${width}x${height}`)
        .outputOptions("-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-c:a", "aac", "-b:a", "128k")
        .outputOptions("-vf", `subtitles='${srtPath.replace(/'/g, "\\'")}'`)
        .save(outputPath)
        .on("end", () => resolve())
        .on("error", (err) => reject(err));
    });

    const videoKey = `renders/${clipId}.mp4`;
    await uploadStream({ key: videoKey, body: createReadStream(outputPath), contentType: "video/mp4" });

    const srtKey = `renders/${clipId}.srt`;
    await uploadStream({ key: srtKey, body: createReadStream(srtPath), contentType: "text/plain" });

    const thumbDir = await tmpDir();
    const thumbnailPath = `${thumbDir}/thumb.jpg`;
    await new Promise<void>((resolve, reject) => {
      ffmpeg(outputPath)
        .screenshots({ count: 1, filename: "thumb.jpg", folder: thumbDir })
        .on("end", () => resolve())
        .on("error", (err) => reject(err));
    });

    const thumbKey = `renders/${clipId}.jpg`;
    await uploadStream({ key: thumbKey, body: createReadStream(thumbnailPath), contentType: "image/jpeg" });

    const videoStat = await fs.stat(outputPath);
    const srtStat = await fs.stat(srtPath);

    const outputAsset = await prisma.asset.create({
      data: {
        type: "video",
        storageKey: videoKey,
        mimeType: "video/mp4",
        sizeBytes: videoStat.size,
        width,
        height,
        durationMs: clip.segment.endMs - clip.segment.startMs
      }
    });

    const srtAsset = await prisma.asset.create({
      data: {
        type: "subtitle",
        storageKey: srtKey,
        mimeType: "text/plain",
        sizeBytes: srtStat.size
      }
    });

    const thumbAsset = await prisma.asset.create({
      data: {
        type: "image",
        storageKey: thumbKey,
        mimeType: "image/jpeg",
        sizeBytes: (await fs.stat(thumbnailPath)).size,
        width,
        height
      }
    });

    await prisma.clip.update({
      where: { id: clipId },
      data: {
        status: "completed",
        outputAssetId: outputAsset.id,
        srtAssetId: srtAsset.id,
        thumbnailAssetId: thumbAsset.id
      }
    });

    await prisma.renderJob.update({
      where: { id: renderJobRecord.id },
      data: { status: "completed", finishedAt: new Date() }
    });

    const minutes = (clip.segment.endMs - clip.segment.startMs) / 60000;
    await prisma.usageEvent.create({
      data: {
        workspaceId: clip.project.workspaceId,
        type: "render",
        amount: minutes
      }
    });

    logger.info({ clipId }, "Render completed");
  } catch (error) {
    await prisma.renderJob.update({
      where: { id: renderJobRecord.id },
      data: { status: "failed", error: error instanceof Error ? error.message : String(error), finishedAt: new Date() }
    });
    await prisma.clip.update({ where: { id: clipId }, data: { status: "failed" } });
    logger.error({ clipId, error }, "Render failed");
    throw error;
  }
};
