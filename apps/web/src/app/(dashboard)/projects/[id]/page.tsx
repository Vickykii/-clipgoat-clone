import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getProjectById } from "@/server/services/projects";
import { ProjectDetail } from "@/components/dashboard/project-detail";

type Params = { params: { id: string } };

export default async function ProjectDetailPage({ params }: Params) {
  const session = await getSession();
  if (!session?.workspace) {
    return null;
  }

  const project = await getProjectById(params.id, session.workspace.id);
  if (!project) {
    notFound();
  }

  return <ProjectDetail initialProject={project} />;
}
