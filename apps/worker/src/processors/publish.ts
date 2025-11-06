import { Job } from "bullmq";
import { prisma } from "@/utils/db";
import { logger } from "@/utils/logger";

type PublishPayload = {
  clipId: string;
  provider: "youtube" | "tiktok";
};

export const publishProcessor = async (job: Job<PublishPayload>) => {
  const { clipId, provider } = job.data;
  logger.info({ clipId, provider }, "Publish stub executed");

  await prisma.post.create({
    data: {
      clipId,
      provider,
      status: "completed",
      publishedAt: new Date()
    }
  });
};
