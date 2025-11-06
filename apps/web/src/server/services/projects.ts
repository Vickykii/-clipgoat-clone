import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { ingestQueue, transcribeQueue, suggestQueue } from "@/lib/queue";
import { JOB_NAMES } from "@clipforge/shared";
import type { CreateProjectInput, SuggestSegmentsInput } from "@clipforge/shared";

export async function createProject(input: CreateProjectInput & { userId: string }) {
  const project = await prisma.project.create({
    data: {
      workspaceId: input.workspaceId,
      title: input.title,
      sourceType: input.sourceType,
      sourceUrl: input.sourceType === "youtube" ? input.youtubeUrl : input.uploadKey,
      status: "pending",
      ingestStatus: "pending"
    }
  });

  await ingestQueue.add(
    JOB_NAMES.ingestProject,
    {
      projectId: project.id,
      sourceType: input.sourceType,
      youtubeUrl: input.youtubeUrl,
      uploadKey: input.uploadKey
    },
    { removeOnComplete: true, removeOnFail: false }
  );

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/projects");

  return project;
}

export async function listProjects(workspaceId: string) {
  return prisma.project.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
    include: {
      clips: true,
      segments: true
    }
  });
}

export async function getProjectById(projectId: string, workspaceId: string) {
  return prisma.project.findFirst({
    where: { id: projectId, workspaceId },
    include: {
      transcription: true,
      segments: {
        orderBy: { aiScore: "desc" }
      },
      clips: {
        include: {
          renderJobs: {
            orderBy: { createdAt: "desc" },
            take: 1
          }
        }
      }
    }
  });
}

export async function enqueueTranscription(projectId: string) {
  const project = await prisma.project.update({
    where: { id: projectId },
    data: { transcriptionStatus: "queued" }
  });
  await transcribeQueue.add(
    JOB_NAMES.transcribeProject,
    { projectId },
    { removeOnComplete: true, attempts: 3, backoff: { type: "exponential", delay: 1000 } }
  );
  return project;
}

export async function enqueueSegmentSuggestion(input: SuggestSegmentsInput) {
  const project = await prisma.project.findUniqueOrThrow({ where: { id: input.projectId } });
  await suggestQueue.add(
    JOB_NAMES.suggestSegments,
    input,
    { removeOnComplete: true, attempts: 2, backoff: { type: "exponential", delay: 2000 } }
  );
  await prisma.project.update({
    where: { id: input.projectId },
    data: { segmentStatus: "queued" }
  });
  return project;
}

export async function enqueueIngest(projectId: string) {
  const project = await prisma.project.findUniqueOrThrow({ where: { id: projectId } });
  await ingestQueue.add(
    JOB_NAMES.ingestProject,
    {
      projectId: project.id,
      sourceType: project.sourceType,
      youtubeUrl: project.sourceType === "youtube" ? project.sourceUrl : undefined,
      uploadKey: project.sourceType === "upload" ? project.sourceUrl : undefined
    },
    { removeOnComplete: true }
  );
  await prisma.project.update({
    where: { id: projectId },
    data: { ingestStatus: "queued" }
  });
  return project;
}
