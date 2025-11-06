import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function ClipsPage() {
  const session = await getSession();
  if (!session?.workspace) {
    return null;
  }

  const clips = await prisma.clip.findMany({
    where: { project: { workspaceId: session.workspace.id } },
    orderBy: { createdAt: "desc" },
    include: {
      project: true,
      segment: true,
      renderJobs: {
        orderBy: { createdAt: "desc" },
        take: 1
      }
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Clips</h1>
        <p className="text-sm text-gray-400">Manage clip renders, download assets, and publish to social platforms.</p>
      </div>

      <div className="grid gap-4">
        {clips.map((clip) => (
          <Card key={clip.id} className="border-white/10 bg-gray-950/80">
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-white">
                  <Link href={`/dashboard/clips/${clip.id}`} className="hover:underline">
                    Clip {clip.id.slice(0, 8)}
                  </Link>
                </CardTitle>
                <p className="text-xs text-gray-400">Project: {clip.project.title ?? "Untitled"}</p>
              </div>
              <Badge variant={clip.status === "ready" ? "default" : clip.status === "failed" ? "outline" : "gray"}>{clip.status}</Badge>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm text-gray-400 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p>Segment: {clip.segment?.title ?? ""}</p>
                <p>Aspect ratio: {clip.aspectRatio}</p>
                {clip.renderJobs[0] ? <p>Last render status: {clip.renderJobs[0].status}</p> : null}
              </div>
              <Button variant="outline" asChild>
                <Link href={`/dashboard/clips/${clip.id}`}>Open editor</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
        {clips.length === 0 ? (
          <Card className="border-white/10 bg-gray-950/80">
            <CardContent className="py-10 text-center text-gray-400">
              No clips yet. Create one from a project segment.
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
