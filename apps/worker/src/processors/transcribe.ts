import { Job } from "bullmq";
import { createWriteStream, createReadStream } from "node:fs";
import { prisma } from "@/utils/db";
import { logger } from "@/utils/logger";
import { env } from "@/env";
import { assemblyAI } from "@/processors/vendors/assemblyai";
import { openai } from "@/processors/vendors/openai";
import { tmpFile } from "@/utils/temp";
import { downloadToFile } from "@/utils/s3";

type TranscribePayload = {
  projectId: string;
};

async function downloadAsset(storageKey: string) {
  const filePath = await tmpFile({ postfix: ".mp3" });
  await downloadToFile(storageKey, createWriteStream(filePath));
  return filePath;
}

export const transcribeProcessor = async (job: Job<TranscribePayload>) => {
  const { projectId } = job.data;
  logger.info({ projectId }, "Transcription job received");

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { asset: true, transcription: true }
  });
  if (!project?.asset) {
    throw new Error("Project asset missing");
  }

  if (env.ASSEMBLYAI_API_KEY && assemblyAI) {
    const response = await assemblyAI.transcripts.create({
      audio_url: `${env.S3_ENDPOINT}/${env.S3_BUCKET}/${project.asset.storageKey}`,
      webhook_url: `${process.env.APP_URL ?? ""}/api/assemblyai/webhook`,
      speaker_labels: true,
      punctuate: true,
      format_text: true
    });

    await prisma.transcription.upsert({
      where: { projectId },
      update: {
        provider: "assemblyai",
        providerJobId: response.id,
        status: "processing"
      },
      create: {
        projectId,
        provider: "assemblyai",
        providerJobId: response.id,
        language: "en",
        words: [],
        text: "",
        status: "processing"
      }
    });

    await prisma.project.update({
      where: { id: projectId },
      data: { transcriptionStatus: "processing" }
    });

    logger.info({ projectId }, "AssemblyAI transcription enqueued");
    return;
  }

  // Fallback: use OpenAI Whisper
  const audioPath = await downloadAsset(project.asset.storageKey);
  const transcription = await openai.audio.transcriptions.create({
    file: createReadStream(audioPath) as any,
    model: "whisper-1",
    response_format: "json"
  });

  await prisma.transcription.upsert({
    where: { projectId },
    update: {
      provider: "openai",
      language: transcription.language ?? "en",
      text: transcription.text ?? "",
      words: [],
      status: "completed"
    },
    create: {
      projectId,
      provider: "openai",
      language: transcription.language ?? "en",
      text: transcription.text ?? "",
      words: [],
      status: "completed"
    }
  });

  await prisma.project.update({
    where: { id: projectId },
    data: { transcriptionStatus: "completed" }
  });

  logger.info({ projectId }, "OpenAI transcription completed");
};
