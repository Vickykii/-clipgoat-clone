import { Job } from "bullmq";
import { prisma } from "@/utils/db";
import { logger } from "@/utils/logger";
import { openai } from "@/processors/vendors/openai";
import { highlightSuggestionResponseSchema, heuristicSegments } from "@clipforge/shared";

type SuggestPayload = {
  projectId: string;
  maxSegments?: number;
};

export const suggestProcessor = async (job: Job<SuggestPayload>) => {
  const { projectId, maxSegments = 10 } = job.data;
  logger.info({ projectId }, "Suggest segments job received");

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { transcription: true, segments: true }
  });
  if (!project?.transcription || project.transcription.status !== "completed") {
    throw new Error("Transcription not ready");
  }

  const transcriptText = project.transcription.text;

  let segmentsData;
  try {
    const prompt = `You are an expert social media editor. Given the transcript below, list up to ${maxSegments} JSON segments with keys id,startMs,endMs,title,hook,aiScore,reasons,aspectRatio,captionMode.
Return strictly valid JSON.

Transcript:
${transcriptText.slice(0, 25000)}
`;
    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: prompt
    });
    const output = response.output_text;
    const parsed = highlightSuggestionResponseSchema.safeParse(JSON.parse(output));
    if (!parsed.success) {
      throw new Error(parsed.error.message);
    }
    segmentsData = parsed.data.segments.map((segment) => ({ ...segment, projectId }));
  } catch (error) {
    logger.warn({ projectId, error }, "LLM highlight generation failed; falling back to heuristic");
    segmentsData = heuristicSegments(
      project.transcription.words as any[],
      project.durationMs ?? 0,
      { count: maxSegments }
    ).map((segment) => ({
      ...segment,
      projectId
    }));
  }

  await prisma.segment.deleteMany({ where: { projectId } });

  await prisma.segment.createMany({
    data: segmentsData.map((segment) => ({
      id: segment.id,
      projectId,
      startMs: Math.round(segment.startMs),
      endMs: Math.round(segment.endMs),
      title: segment.title,
      hook: segment.hook,
      aiScore: segment.aiScore,
      reasons: segment.reasons,
      aspectRatio: segment.aspectRatio,
      captionMode: segment.captionMode
    }))
  });

  await prisma.project.update({
    where: { id: projectId },
    data: { segmentStatus: "completed", status: "ready" }
  });

  logger.info({ projectId }, "Segments suggested");
};
