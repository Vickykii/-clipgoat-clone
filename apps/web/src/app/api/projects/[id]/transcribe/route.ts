import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { enqueueTranscription } from "@/server/services/projects";

type Params = { params: { id: string } };

export async function POST(_request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.workspace?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    await enqueueTranscription(params.id);
    return NextResponse.json({ status: "queued" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to queue transcription" }, { status: 500 });
  }
}
