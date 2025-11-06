"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/lib/providers/toast-context";

type BrandKit = {
  primaryColor: string;
  secondaryColor: string;
  font: string;
  watermarkUrl?: string | null;
  captionStyle?: Record<string, unknown>;
};

export function BrandKitForm() {
  const { toast } = useToast();

  const query = useQuery({
    queryKey: ["brand-kit"],
    queryFn: async () => {
      const res = await fetch("/api/brand-kit");
      if (!res.ok) throw new Error("Unable to load brand kit");
      const data = await res.json();
      return data.brandKit as BrandKit;
    }
  });

  const mutation = useMutation({
    mutationFn: async (payload: BrandKit) => {
      const res = await fetch("/api/brand-kit", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to update brand kit");
      return res.json();
    },
    onSuccess() {
      toast({ title: "Brand kit updated" });
      query.refetch();
    },
    onError(error) {
      toast({ title: "Update failed", description: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  if (query.isLoading || !query.data) {
    return <p className="text-sm text-gray-400">Loading brand kit...</p>;
  }

  const kit = query.data;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const payload: BrandKit = {
      primaryColor: (form.elements.namedItem("primaryColor") as HTMLInputElement).value,
      secondaryColor: (form.elements.namedItem("secondaryColor") as HTMLInputElement).value,
      font: (form.elements.namedItem("font") as HTMLInputElement).value,
      watermarkUrl: (form.elements.namedItem("watermarkUrl") as HTMLInputElement).value || null
    };
    mutation.mutate(payload);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="primaryColor">Primary color</Label>
          <Input id="primaryColor" name="primaryColor" type="color" defaultValue={kit.primaryColor ?? "#7c3aed"} />
        </div>
        <div>
          <Label htmlFor="secondaryColor">Secondary color</Label>
          <Input id="secondaryColor" name="secondaryColor" type="color" defaultValue={kit.secondaryColor ?? "#ffffff"} />
        </div>
      </div>
      <div>
        <Label htmlFor="font">Font</Label>
        <Input id="font" name="font" defaultValue={kit.font ?? "Inter"} />
      </div>
      <div>
        <Label htmlFor="watermarkUrl">Watermark URL</Label>
        <Input id="watermarkUrl" name="watermarkUrl" defaultValue={kit.watermarkUrl ?? ""} placeholder="https://..." />
      </div>
      <Button type="submit" disabled={mutation.isLoading}>
        Save changes
      </Button>
    </form>
  );
}
