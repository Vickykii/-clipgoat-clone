import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { renderQueue } from "@/lib/queue";
import { JOB_NAMES, type CreateClipInput, type EnqueueRenderInput, type UpdateClipInput } from "@clipforge/shared";

export async function createClip(input: CreateClipInput & { workspaceId: string }) {
  const segment = await prisma.segment.findUniqueOrThrow({ where: { id: input.segmentId } });
  if (segment.projectId !== input.projectId) {
    throw new Error("Segment does not belong to project");
  }

  const clip = await prisma.clip.create({
    data: {
      projectId: input.projectId,
      segmentId: input.segmentId,
      aspectRatio: input.aspectRatio,
      style: input.style,
      status: "pending"
    }
  });

  revalidatePath(`/dashboard/projects/${input.projectId}`);
  return clip;
}

export async function enqueueRender(input: EnqueueRenderInput & { workspaceId: string }) {
  const clip = await prisma.clip.update({
    where: { id: input.clipId },
    data: { status: "queued" },
    include: {
      project: true,
      segment: true
    }
  });

  await renderQueue.add(
    JOB_NAMES.renderClip,
    { clipId: clip.id, force: input.force },
    { removeOnComplete: true, attempts: 3, backoff: { type: "exponential", delay: 2000 } }
  );

  revalidatePath(`/dashboard/projects/${clip.projectId}`);
  revalidatePath(`/dashboard/clips/${clip.id}`);

  return clip;
}

export async function getClipById(clipId: string, workspaceId: string) {
  return prisma.clip.findFirst({
    where: { id: clipId, project: { workspaceId } },
    include: {
      project: true,
      segment: true,
      renderJobs: {
        orderBy: { createdAt: "desc" }
      },
      outputAsset: true,
      srtAsset: true,
      thumbnailAsset: true
    }
  });
}

export async function updateClip(clipId: string, workspaceId: string, data: UpdateClipInput) {
  const clip = await prisma.clip.findFirst({ where: { id: clipId, project: { workspaceId } } });
  if (!clip) {
    throw new Error("Clip not found");
  }
  return prisma.clip.update({
    where: { id: clipId },
    data
  });
}
