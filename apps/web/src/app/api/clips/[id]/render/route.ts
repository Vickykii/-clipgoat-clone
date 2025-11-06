import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { enqueueRenderSchema } from "@clipforge/shared";
import { enqueueRender } from "@/server/services/clips";

type Params = { params: { id: string } };

export async function POST(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.workspace?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const json = await request.json().catch(() => ({}));
  const parsed = enqueueRenderSchema.safeParse({ ...json, clipId: params.id });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    await enqueueRender({ ...parsed.data, workspaceId: session.workspace.id });
    return NextResponse.json({ status: "queued" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to enqueue render" }, { status: 500 });
  }
}
