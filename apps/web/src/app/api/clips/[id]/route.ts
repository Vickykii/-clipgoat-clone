import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { getClipById, updateClip } from "@/server/services/clips";
import { updateClipSchema } from "@clipforge/shared";

type Params = { params: { id: string } };

export async function GET(_request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.workspace?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const clip = await getClipById(params.id, session.workspace.id);
  if (!clip) {
    return new NextResponse("Not found", { status: 404 });
  }

  return NextResponse.json({ clip });
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.workspace?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const payload = await request.json();
  const parsed = updateClipSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const clip = await updateClip(params.id, session.workspace.id, parsed.data);
    return NextResponse.json({ clip });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update clip" }, { status: 500 });
  }
}
