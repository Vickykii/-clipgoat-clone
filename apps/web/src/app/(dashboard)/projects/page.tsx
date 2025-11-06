import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const statusColor: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-200",
  processing: "bg-blue-500/20 text-blue-200",
  ready: "bg-emerald-500/20 text-emerald-200",
  failed: "bg-red-500/20 text-red-200"
};

export default async function ProjectsPage() {
  const session = await getSession();
  if (!session?.workspace) {
    return null;
  }

  const projects = await prisma.project.findMany({
    where: { workspaceId: session.workspace.id },
    orderBy: { createdAt: "desc" },
    include: {
      clips: true,
      segments: true
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Projects</h1>
          <p className="text-sm text-gray-400">Ingest videos, generate transcripts, and craft highlight segments.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/projects/new">New project</Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {projects.map((project) => (
          <Card key={project.id} className="border-white/10 bg-gray-950/80">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white">
                  <Link href={`/dashboard/projects/${project.id}`} className="hover:underline">
                    {project.title ?? "Untitled project"}
                  </Link>
                </CardTitle>
                <p className="text-xs uppercase tracking-wide text-gray-500">{project.sourceType}</p>
              </div>
              <Badge className={statusColor[project.status] ?? "bg-gray-500/20 text-gray-200"}>{project.status}</Badge>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm text-gray-400 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-6">
                <span>{project.segments.length} suggested segments</span>
                <span>{project.clips.length} clips</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/projects/${project.id}`}>Open</Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/dashboard/projects/${project.id}/segments`}>Segments</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {projects.length === 0 ? (
          <Card className="border-white/10 bg-gray-950/80">
            <CardContent className="py-10 text-center text-gray-400">
              No projects yet. <Link className="text-white underline" href="/dashboard/projects/new">Create your first one.</Link>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
