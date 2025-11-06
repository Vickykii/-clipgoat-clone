import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { getClipById } from "@/server/services/clips";
import { createDownloadUrl } from "@/lib/clients/s3";

type Params = { params: { id: string } };

export async function GET(_request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.workspace?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const clip = await getClipById(params.id, session.workspace.id);
  if (!clip?.outputAsset) {
    return new NextResponse("Not found", { status: 404 });
  }

  const url = await createDownloadUrl(clip.outputAsset.storageKey);
  return NextResponse.json({ url });
}
