"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/lib/providers/toast-context";

async function uploadFile(file: File) {
  const presign = await fetch("/api/uploads/s3-presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileName: file.name, fileType: file.type, fileSize: file.size })
  }).then((res) => res.json());

  await fetch(presign.signedUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
      "Content-Length": `${file.size}`
    },
    body: file
  });

  return presign.key as string;
}

export function NewProjectForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [source, setSource] = useState<"youtube" | "upload">("youtube");

  const mutation = useMutation({
    mutationFn: async () => {
      let uploadKey: string | undefined;
      if (source === "upload") {
        if (!file) throw new Error("Please select a file to upload");
        uploadKey = await uploadFile(file);
      }

      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceType: source,
          youtubeUrl: source === "youtube" ? youtubeUrl : undefined,
          uploadKey,
          title: title || undefined
        })
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to create project");
      }
      return response.json();
    },
    onSuccess(data) {
      toast({ title: "Project queued", description: "Ingest has started" });
      router.push(`/dashboard/projects/${data.project.id}`);
    },
    onError(error: unknown) {
      toast({ title: "Unable to create project", description: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <Label>Project title</Label>
        <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Optional title" />
      </div>
      <Tabs value={source} onValueChange={(value) => setSource(value as typeof source)}>
        <TabsList>
          <TabsTrigger value="youtube">YouTube URL</TabsTrigger>
          <TabsTrigger value="upload">Upload file</TabsTrigger>
        </TabsList>
        <TabsContent value="youtube" className="space-y-3">
          <Label htmlFor="youtubeUrl">Paste a YouTube link</Label>
          <Input
            id="youtubeUrl"
            value={youtubeUrl}
            onChange={(event) => setYoutubeUrl(event.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </TabsContent>
        <TabsContent value="upload" className="space-y-3">
          <Label htmlFor="file">Upload MP4 / MOV / MP3</Label>
          <Input id="file" type="file" accept="video/*,audio/*" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
        </TabsContent>
      </Tabs>
      <Button onClick={() => mutation.mutate()} disabled={mutation.isLoading} className="w-full">
        {mutation.isLoading ? "Creating..." : "Create project"}
      </Button>
    </div>
  );
}
