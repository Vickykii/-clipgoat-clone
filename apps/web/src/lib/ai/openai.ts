import OpenAI from "openai";
import { env } from "@/lib/env";

export const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY, baseURL: process.env.OPENAI_BASE_URL });

export async function generateHighlightSuggestions({
  transcript,
  projectTitle,
  maxSegments
}: {
  transcript: string;
  projectTitle: string;
  maxSegments: number;
}) {
  const prompt = `You are an expert social media editor. Given the transcript below, extract up to ${maxSegments} non-overlapping compelling short-form segments between 15-60 seconds. Provide JSON with schema {segments:[{startMs,endMs,title,hook,aiScore,reasons,aspectRatio,captionMode,emojis}]}. Aim for high-energy, valuable insights, or strong emotional hooks.

Title: ${projectTitle}
Transcript:
${transcript.slice(0, 30000)}
`;

  const response = await openai.responses.create({
    model: "gpt-4o-mini",
    input: prompt,
    temperature: 0.6
  });

  const text = response.output_text;
  return text;
}
