import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth/options";
import { listWorkspaces, createWorkspace } from "@/server/services/workspaces";

const createSchema = z.object({
  name: z.string().min(2).max(100)
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const workspaces = await listWorkspaces(session.user.id);
  return NextResponse.json({ workspaces });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const workspace = await createWorkspace({ userId: session.user.id, name: parsed.data.name });
  return NextResponse.json({ workspace }, { status: 201 });
}
