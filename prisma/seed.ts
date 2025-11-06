import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "demo@clipforge.app" },
    update: {},
    create: {
      email: "demo@clipforge.app",
      name: "Demo User"
    }
  });

  const workspace = await prisma.workspace.create({
    data: {
      name: "Demo Workspace",
      ownerId: user.id,
      memberships: {
        create: {
          userId: user.id,
          role: "owner"
        }
      },
      brandKit: {
        create: {
          primaryColor: "#7c3aed",
          secondaryColor: "#ffffff",
          font: "Inter",
          captionStyle: {
            size: 42,
            weight: "bold",
            strokeColor: "#000000",
            strokeWidth: 4
          }
        }
      },
      billing: {
        create: {
          plan: "free",
          usageMinutesThisPeriod: 0
        }
      }
    }
  });

  console.log("Seeded demo workspace", workspace.id);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
