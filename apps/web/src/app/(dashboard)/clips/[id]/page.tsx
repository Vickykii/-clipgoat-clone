import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getClipById } from "@/server/services/clips";
import { ClipEditor } from "@/components/editor/clip-editor";

type Params = { params: { id: string } };

export default async function ClipDetailPage({ params }: Params) {
  const session = await getSession();
  if (!session?.workspace) {
    return null;
  }

  const clip = await getClipById(params.id, session.workspace.id);
  if (!clip) {
    notFound();
  }

  return <ClipEditor initialClip={clip} />;
}
