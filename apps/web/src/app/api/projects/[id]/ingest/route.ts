import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { enqueueIngest } from "@/server/services/projects";

type Params = { params: { id: string } };

export async function POST(_request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.workspace?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    await enqueueIngest(params.id);
    return NextResponse.json({ status: "queued" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to queue ingest" }, { status: 500 });
  }
}
