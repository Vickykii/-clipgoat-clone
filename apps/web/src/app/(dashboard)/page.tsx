import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function DashboardHomePage() {
  const session = await getSession();
  if (!session?.workspace) {
    return null;
  }

  const [recentProjects, metrics] = await Promise.all([
    prisma.project.findMany({
      where: { workspaceId: session.workspace.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        segments: true,
        clips: true
      }
    }),
    prisma.usageEvent.groupBy({
      by: ["type"],
      where: { workspaceId: session.workspace.id },
      _sum: { amount: true }
    })
  ]);

  const transcriptionMinutes = metrics.find((metric) => metric.type === "transcribe")?._sum.amount ?? 0;
  const renderMinutes = metrics.find((metric) => metric.type === "render")?._sum.amount ?? 0;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="border-white/10 bg-gray-950/70">
        <CardHeader>
          <CardTitle className="text-white">Usage overview</CardTitle>
          <CardDescription>Track your monthly quota consumption.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-white/5 bg-white/5 p-4">
            <p className="text-sm text-gray-400">Transcription minutes</p>
            <p className="mt-2 text-2xl font-semibold text-white">{transcriptionMinutes.toFixed(1)}</p>
          </div>
          <div className="rounded-lg border border-white/5 bg-white/5 p-4">
            <p className="text-sm text-gray-400">Render minutes</p>
            <p className="mt-2 text-2xl font-semibold text-white">{renderMinutes.toFixed(1)}</p>
          </div>
          <div className="rounded-lg border border-white/5 bg-white/5 p-4 sm:col-span-2">
            <p className="text-sm text-gray-400">Plan</p>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="outline">{session.workspace.plan}</Badge>
              <Button variant="link" className="text-brand-300" asChild>
                <Link href="/dashboard/billing">Manage plan</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-gray-950/70">
        <CardHeader>
          <CardTitle className="text-white">Quick actions</CardTitle>
          <CardDescription>Jump back into editing or create something new.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button asChild>
            <Link href="/dashboard/projects/new">New project</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/dashboard/projects">View all projects</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/dashboard/clips">Browse clips</Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2 border-white/10 bg-gray-950/70">
        <CardHeader>
          <CardTitle className="text-white">Recent projects</CardTitle>
          <CardDescription>Projects process fastest when transcription is completed.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentProjects.length === 0 ? (
            <p className="text-sm text-gray-400">No projects yet. Start by ingesting a YouTube link.</p>
          ) : (
            recentProjects.map((project) => (
              <div key={project.id} className="flex flex-col gap-2 rounded-lg border border-white/5 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <Link href={`/dashboard/projects/${project.id}`} className="text-lg font-semibold text-white">
                    {project.title ?? "Untitled project"}
                  </Link>
                  <p className="text-xs uppercase tracking-wide text-gray-500">{project.status}</p>
                </div>
                <div className="flex items-center gap-6 text-sm text-gray-400">
                  <span>{project.segments.length} segments</span>
                  <span>{project.clips.length} clips</span>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/dashboard/projects/${project.id}`}>Open</Link>
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
