import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { suggestSegmentsSchema } from "@clipforge/shared";
import { enqueueSegmentSuggestion } from "@/server/services/projects";

type Params = { params: { id: string } };

export async function POST(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.workspace?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const json = await request.json().catch(() => ({}));
  const parsed = suggestSegmentsSchema.safeParse({ ...json, projectId: params.id });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    await enqueueSegmentSuggestion(parsed.data);
    return NextResponse.json({ status: "queued" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to queue suggestion" }, { status: 500 });
  }
}
