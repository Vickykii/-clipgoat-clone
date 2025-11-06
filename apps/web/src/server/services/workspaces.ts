import { prisma } from "@/lib/db";

export async function listWorkspaces(userId: string) {
  const memberships = await prisma.membership.findMany({
    where: { userId },
    include: { workspace: true }
  });
  return memberships.map((membership) => ({
    id: membership.workspaceId,
    role: membership.role,
    name: membership.workspace.name,
    plan: membership.workspace.plan
  }));
}

export async function createWorkspace({ userId, name }: { userId: string; name: string }) {
  const workspace = await prisma.workspace.create({
    data: {
      name,
      ownerId: userId,
      plan: "free",
      memberships: {
        create: {
          userId,
          role: "owner"
        }
      },
      billing: {
        create: {
          plan: "free",
          usageMinutesThisPeriod: 0
        }
      },
      brandKit: {
        create: {
          primaryColor: "#7c3aed",
          secondaryColor: "#ffffff",
          font: "Inter",
          captionStyle: {
            size: 36,
            weight: "bold",
            strokeColor: "#000000",
            strokeWidth: 4
          }
        }
      }
    }
  });
  return workspace;
}
