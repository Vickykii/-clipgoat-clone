import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || authHeader !== `Bearer ${env.ASSEMBLYAI_API_KEY}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const payload = await request.json();
  const transcriptId = payload.id as string | undefined;
  if (!transcriptId) {
    return NextResponse.json({ error: "Missing transcript id" }, { status: 400 });
  }

  const transcription = await prisma.transcription.findFirst({ where: { providerJobId: transcriptId } });
  if (!transcription) {
    return NextResponse.json({ error: "Transcription not found" }, { status: 404 });
  }

  const words = Array.isArray(payload.words)
    ? payload.words.map((word: any) => ({
        text: word.text,
        startMs: Math.floor((word.start ?? 0) * 1000),
        endMs: Math.floor((word.end ?? 0) * 1000),
        speaker: word.speaker ?? ""
      }))
    : [];

  await prisma.transcription.update({
    where: { id: transcription.id },
    data: {
      status: payload.status === "completed" ? "completed" : "failed",
      text: payload.text ?? "",
      words,
      language: payload.language ?? "en"
    }
  });

  await prisma.project.update({
    where: { id: transcription.projectId },
    data: { transcriptionStatus: payload.status === "completed" ? "completed" : "failed" }
  });

  return NextResponse.json({ received: true });
}
