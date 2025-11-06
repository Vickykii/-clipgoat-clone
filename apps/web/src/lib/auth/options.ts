import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { type NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";
import { env } from "@/lib/env";
import { prisma } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "database"
  },
  pages: {
    signIn: "/auth/signin"
  },
  providers: [
    EmailProvider({
      server: {
        host: env.EMAIL_SERVER_HOST,
        port: env.EMAIL_SERVER_PORT,
        auth: {
          user: env.EMAIL_SERVER_USER,
          pass: env.EMAIL_SERVER_PASSWORD
        }
      },
      from: env.EMAIL_FROM
    }),
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET
    })
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        const membership = await prisma.membership.findFirst({
          where: { userId: user.id },
          include: { workspace: true }
        });
        if (membership) {
          session.workspace = {
            id: membership.workspaceId,
            role: membership.role,
            name: membership.workspace.name,
            plan: membership.workspace.plan
          };
        }
      }
      return session;
    },
    async signIn({ user }) {
      const existingMembership = await prisma.membership.findFirst({ where: { userId: user.id } });
      if (!existingMembership) {
        const workspace = await prisma.workspace.create({
          data: {
            name: `${user.name ?? "New"}'s Workspace`,
            ownerId: user.id,
            plan: "free",
            memberships: {
              create: {
                userId: user.id,
                role: "owner"
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
        await prisma.brandKit.create({
          data: {
            workspaceId: workspace.id,
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
        });
      }
      return true;
    }
  }
};
