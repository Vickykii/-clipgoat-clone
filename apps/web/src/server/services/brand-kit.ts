import { prisma } from "@/lib/db";

export async function getBrandKit(workspaceId: string) {
  return prisma.brandKit.findUnique({ where: { workspaceId } });
}

export async function updateBrandKit(workspaceId: string, data: Partial<{ primaryColor: string; secondaryColor: string; font: string; watermarkUrl?: string | null; captionStyle: Record<string, unknown> }>) {
  return prisma.brandKit.update({
    where: { workspaceId },
    data
  });
}
