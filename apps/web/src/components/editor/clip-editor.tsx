"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { Prisma } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/lib/providers/toast-context";

type ClipDetailData = Prisma.ClipGetPayload<{
  include: {
    segment: true;
    project: true;
    renderJobs: {
      orderBy: { createdAt: "desc" };
    };
    outputAsset: true;
    srtAsset: true;
  };
}>;

type ClipStyle = {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  backgroundColor?: string;
  captionStyle?: {
    size?: number;
    weight?: string;
    strokeColor?: string;
    strokeWidth?: number;
  };
  watermarkUrl?: string | null;
};

const defaultStyle: ClipStyle = {
  primaryColor: "#7c3aed",
  secondaryColor: "#ffffff",
  fontFamily: "Inter",
  backgroundColor: "#000000",
  captionStyle: {
    size: 42,
    weight: "bold",
    strokeColor: "#000000",
    strokeWidth: 4
  }
};

export function ClipEditor({ initialClip }: { initialClip: ClipDetailData }) {
  const { toast } = useToast();
  const [aspectRatio, setAspectRatio] = useState(initialClip.aspectRatio);
  const [styleState, setStyleState] = useState<ClipStyle>(() => ({ ...defaultStyle, ...(initialClip.style as ClipStyle | null ?? {}) }));
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["clip", initialClip.id],
    queryFn: async () => {
      const res = await fetch(`/api/clips/${initialClip.id}`);
      if (!res.ok) throw new Error("Failed to load clip");
      const data = await res.json();
      return data.clip as ClipDetailData;
    },
    initialData: initialClip,
    refetchInterval: 10000
  });

  const clip = query.data;

  useEffect(() => {
    if (clip.outputAsset) {
      fetch(`/api/clips/${clip.id}/download`)
        .then((res) => (res.ok ? res.json() : Promise.reject()))
        .then((data) => setPreviewUrl(data.url))
        .catch(() => setPreviewUrl(null));
    }
  }, [clip.id, clip.outputAsset?.id, clip.renderJobs[0]?.status]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/clips/${clip.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aspectRatio, style: styleState })
      });
      if (!res.ok) throw new Error("Unable to update clip");
    },
    onSuccess() {
      toast({ title: "Clip updated" });
      query.refetch();
    },
    onError(error) {
      toast({ title: "Update failed", description: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  const renderMutation = useMutation({
    mutationFn: async () => {
      await updateMutation.mutateAsync();
      const res = await fetch(`/api/clips/${clip.id}/render`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force: true })
      });
      if (!res.ok) throw new Error("Failed to queue render");
    },
    onSuccess() {
      toast({ title: "Render queued", description: "Rendering in worker" });
      query.refetch();
    },
    onError(error) {
      toast({ title: "Render failed", description: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  const download = async () => {
    const res = await fetch(`/api/clips/${clip.id}/download`);
    if (!res.ok) {
      toast({ title: "Download unavailable" });
      return;
    }
    const data = await res.json();
    window.open(data.url, "_blank");
  };

  const handleStyleChange = (key: keyof ClipStyle, value: string | number) => {
    setStyleState((prev) => ({ ...prev, [key]: value }));
  };

  const handleCaptionStyleChange = (key: keyof NonNullable<ClipStyle["captionStyle"]>, value: string | number) => {
    setStyleState((prev) => ({
      ...prev,
      captionStyle: {
        ...(prev.captionStyle ?? {}),
        [key]: value
      }
    }));
  };

  const jobStatus = clip.renderJobs[0]?.status ?? "idle";

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
      <Card className="border-white/10 bg-gray-950/80">
        <CardHeader>
          <CardTitle className="text-white">Clip preview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-hidden rounded-lg border border-white/10 bg-black/60">
            {previewUrl ? (
              <video
                key={previewUrl}
                src={previewUrl}
                controls
                className="w-full"
              />
            ) : (
              <div className="flex h-64 items-center justify-center text-sm text-gray-500">
                Render output will appear here once ready.
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => renderMutation.mutate()} disabled={renderMutation.isLoading}>
              {renderMutation.isLoading ? "Rendering..." : "Render clip"}
            </Button>
            <Button variant="secondary" onClick={download} disabled={!clip.outputAsset}>
              Download MP4
            </Button>
            <Button variant="ghost" onClick={() => query.refetch()}>
              Refresh status
            </Button>
          </div>
          <p className="text-xs text-gray-500">Latest render job: {jobStatus}</p>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-gray-950/80">
        <CardHeader>
          <CardTitle className="text-white">Style settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-gray-200">
          <Tabs value={aspectRatio} onValueChange={(value) => setAspectRatio(value as typeof aspectRatio)}>
            <TabsList>
              <TabsTrigger value="9:16">Vertical</TabsTrigger>
              <TabsTrigger value="16:9">Horizontal</TabsTrigger>
              <TabsTrigger value="1:1">Square</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid gap-3">
            <div className="flex items-center justify-between gap-4">
              <Label>Primary color</Label>
              <Input type="color" value={styleState.primaryColor} onChange={(event) => handleStyleChange("primaryColor", event.target.value)} className="h-10 w-20" />
            </div>
            <div className="flex items-center justify-between gap-4">
              <Label>Secondary color</Label>
              <Input type="color" value={styleState.secondaryColor} onChange={(event) => handleStyleChange("secondaryColor", event.target.value)} className="h-10 w-20" />
            </div>
            <div className="flex items-center justify-between gap-4">
              <Label>Background</Label>
              <Input type="color" value={styleState.backgroundColor ?? "#000000"} onChange={(event) => handleStyleChange("backgroundColor", event.target.value)} className="h-10 w-20" />
            </div>
            <div>
              <Label>Font family</Label>
              <Input value={styleState.fontFamily} onChange={(event) => handleStyleChange("fontFamily", event.target.value)} />
            </div>
          </div>

          <div className="border-t border-white/5 pt-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">Caption style</p>
            <div className="mt-3 grid gap-3">
              <div>
                <Label>Font size</Label>
                <Input
                  type="number"
                  value={styleState.captionStyle?.size ?? 42}
                  onChange={(event) => handleCaptionStyleChange("size", Number(event.target.value))}
                />
              </div>
              <div>
                <Label>Stroke width</Label>
                <Input
                  type="number"
                  value={styleState.captionStyle?.strokeWidth ?? 4}
                  onChange={(event) => handleCaptionStyleChange("strokeWidth", Number(event.target.value))}
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <Label>Stroke color</Label>
                <Input
                  type="color"
                  value={styleState.captionStyle?.strokeColor ?? "#000000"}
                  onChange={(event) => handleCaptionStyleChange("strokeColor", event.target.value)}
                  className="h-10 w-20"
                />
              </div>
            </div>
          </div>

          <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isLoading} className="w-full" variant="secondary">
            Save style
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
