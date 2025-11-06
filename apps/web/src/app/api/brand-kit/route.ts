import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth/options";
import { getBrandKit, updateBrandKit } from "@/server/services/brand-kit";

const updateSchema = z.object({
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  font: z.string().optional(),
  watermarkUrl: z.string().url().nullable().optional(),
  captionStyle: z.record(z.any()).optional()
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.workspace?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const kit = await getBrandKit(session.workspace.id);
  return NextResponse.json({ brandKit: kit });
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.workspace?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const kit = await updateBrandKit(session.workspace.id, parsed.data);
  return NextResponse.json({ brandKit: kit });
}
