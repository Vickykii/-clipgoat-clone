"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { Prisma } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/lib/providers/toast-context";
import { millisToTimestamp } from "@clipforge/shared";

type ProjectDetailData = Prisma.ProjectGetPayload<{
  include: {
    transcription: true;
    segments: true;
    clips: {
      include: {
        renderJobs: {
          orderBy: { createdAt: "desc" };
          take: 1;
        };
      };
    };
  };
}>;

export function ProjectDetail({ initialProject }: { initialProject: ProjectDetailData }) {
  const router = useRouter();
  const { toast } = useToast();

  const query = useQuery({
    queryKey: ["project", initialProject.id],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${initialProject.id}`);
      if (!response.ok) throw new Error("Failed to load project");
      const data = await response.json();
      return data.project as ProjectDetailData;
    },
    initialData: initialProject,
    refetchInterval: 10000
  });

  const ingestMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/projects/${initialProject.id}/ingest`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to queue ingest");
    },
    onSuccess() {
      toast({ title: "Ingest queued", description: "We will fetch and store the source asset." });
      query.refetch();
    },
    onError(error) {
      toast({ title: "Unable to ingest", description: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  const transcribeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/projects/${initialProject.id}/transcribe`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to queue transcription");
    },
    onSuccess() {
      toast({ title: "Transcription queued", description: "We'll notify once the transcript is ready." });
      query.refetch();
    },
    onError(error) {
      toast({ title: "Unable to transcribe", description: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  const suggestMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/projects/${initialProject.id}/suggest-segments`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to queue suggestions");
    },
    onSuccess() {
      toast({ title: "Segment suggestions queued", description: "Highlights will appear shortly." });
      query.refetch();
    },
    onError(error) {
      toast({ title: "Unable to suggest segments", description: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  const createClipMutation = useMutation({
    mutationFn: async (segmentId: string) => {
      const res = await fetch("/api/clips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: initialProject.id,
          segmentId,
          aspectRatio: "9:16",
          style: {
            theme: "custom",
            primaryColor: "#7c3aed",
            secondaryColor: "#ffffff",
            fontFamily: "Inter",
            captionStyle: {
              size: 38,
              weight: "bold",
              strokeColor: "#000000",
              strokeWidth: 4
            }
          }
        })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to create clip");
      }
      return res.json();
    },
    onSuccess(data) {
      toast({ title: "Clip created", description: "Opening editor" });
      router.push(`/dashboard/clips/${data.clip.id}`);
    },
    onError(error) {
      toast({ title: "Unable to create clip", description: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  const project = query.data;
  const transcriptText = project.transcription?.text ?? "Transcript pending. Start transcription to populate.";
  const segments = useMemo(() => project.segments ?? [], [project.segments]);

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
      <div className="space-y-6">
        <Card className="border-white/10 bg-gray-950/80">
          <CardHeader>
            <CardTitle className="text-white">{project.title ?? "Untitled project"}</CardTitle>
            <CardDescription className="text-gray-400">
              Status: <span className="uppercase">{project.status}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" onClick={() => ingestMutation.mutate()} disabled={ingestMutation.isLoading}>
                Re-run ingest
              </Button>
              <Button onClick={() => transcribeMutation.mutate()} disabled={transcribeMutation.isLoading}>
                {project.transcriptionStatus === "completed" ? "Re-run transcription" : "Start transcription"}
              </Button>
              <Button variant="outline" onClick={() => suggestMutation.mutate()} disabled={suggestMutation.isLoading}>
                Suggest segments
              </Button>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">Transcript</p>
              <ScrollArea className="mt-3 h-72 rounded border border-white/5 bg-black/30 p-4 text-sm leading-relaxed text-gray-200">
                {transcriptText}
              </ScrollArea>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-gray-950/80">
          <CardHeader>
            <CardTitle className="text-white">Suggested segments</CardTitle>
            <CardDescription className="text-gray-400">
              Pick a segment to launch the clip editor.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {segments.length === 0 ? (
              <p className="text-sm text-gray-400">No segments yet. Run suggestions once the transcript is ready.</p>
            ) : (
              segments.map((segment) => (
                <div key={segment.id} className="rounded-lg border border-white/10 bg-black/40 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-white">{segment.title}</p>
                      <p className="text-xs text-gray-400">
                        {millisToTimestamp(segment.startMs)} - {millisToTimestamp(segment.endMs)}
                      </p>
                    </div>
                    <Badge variant="outline">Score {segment.aiScore.toFixed(2)}</Badge>
                  </div>
                  <p className="mt-3 text-sm text-gray-300">{segment.hook}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {Array.isArray(segment.reasons)
                      ? segment.reasons.map((reason) => (
                          <Badge key={reason} variant="gray">
                            {reason}
                          </Badge>
                        ))
                      : null}
                  </div>
                  <Button
                    className="mt-4"
                    onClick={() => createClipMutation.mutate(segment.id)}
                    disabled={createClipMutation.isLoading}
                  >
                    Create clip
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
      <div className="space-y-6">
        <Card className="border-white/10 bg-gray-950/80">
          <CardHeader>
            <CardTitle className="text-white">Clip renders</CardTitle>
            <CardDescription className="text-gray-400">Track render job status and download outputs.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-300">
            {project.clips.length === 0 ? (
              <p className="text-sm text-gray-400">No clips yet. Create one from a suggested segment.</p>
            ) : (
              project.clips.map((clip) => {
                const latestJob = clip.renderJobs?.[0];
                return (
                  <div key={clip.id} className="rounded-lg border border-white/10 bg-black/40 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-white">Clip {clip.id.slice(0, 8)}</p>
                        <p className="text-xs uppercase tracking-wide text-gray-500">{clip.status}</p>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <a href={`/dashboard/clips/${clip.id}`}>Open</a>
                      </Button>
                    </div>
                    {latestJob ? (
                      <p className="mt-2 text-xs text-gray-500">Last render: {latestJob.status}</p>
                    ) : null}
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-gray-950/80">
          <CardHeader>
            <CardTitle className="text-white">Legal reminder</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-400">
            Ensure you have rights to ingest and repurpose any content processed by ClipForge. All downloads are
            watermarked with traceable IDs for compliance.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
