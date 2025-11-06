import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & { id: string };
    workspace?: {
      id: string;
      name: string;
      role: string;
      plan: string;
    };
  }
}
