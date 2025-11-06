import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth/options";
import { getServerSession } from "next-auth";
import { createProjectSchema, paginationSchema } from "@clipforge/shared";
import { createProject, listProjects } from "@/server/services/projects";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.workspace?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const parsed = paginationSchema.safeParse({
    cursor: searchParams.get("cursor") ?? undefined,
    limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined
  });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const projects = await listProjects(session.workspace.id);
  return NextResponse.json({ projects });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.workspace?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const json = await request.json();
  const parsed = createProjectSchema.safeParse({ ...json, workspaceId: session.workspace.id });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const project = await createProject({ ...parsed.data, userId: session.user.id });
    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
