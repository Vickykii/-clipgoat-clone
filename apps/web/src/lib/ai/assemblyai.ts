import { AssemblyAI } from "assemblyai";
import { env } from "@/lib/env";

export const assemblyAI = env.ASSEMBLYAI_API_KEY
  ? new AssemblyAI({ apiKey: env.ASSEMBLYAI_API_KEY })
  : null;

export async function createAssemblyJob({
  audioUrl,
  webhookUrl
}: {
  audioUrl: string;
  webhookUrl: string;
}) {
  if (!assemblyAI) {
    throw new Error("AssemblyAI API key not configured");
  }
  const response = await assemblyAI.transcripts.create({
    audio_url: audioUrl,
    webhook_url: webhookUrl,
    speaker_labels: true,
    word_boost: ["viral", "hook", "story"],
    punctuate: true,
    format_text: true,
    auto_chapters: true
  });
  return response;
}
