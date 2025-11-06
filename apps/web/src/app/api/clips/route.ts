import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { createClipSchema } from "@clipforge/shared";
import { createClip } from "@/server/services/clips";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.workspace?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const payload = await request.json();
  const parsed = createClipSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const clip = await createClip({ ...parsed.data, workspaceId: session.workspace.id });
    return NextResponse.json({ clip }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create clip" }, { status: 500 });
  }
}
