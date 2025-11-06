import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { getProjectById } from "@/server/services/projects";

type Params = {
  params: {
    id: string;
  };
};

export async function GET(_request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.workspace?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const project = await getProjectById(params.id, session.workspace.id);
  if (!project) {
    return new NextResponse("Not found", { status: 404 });
  }

  return NextResponse.json({ project });
}
