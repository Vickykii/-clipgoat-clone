import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrandKitForm } from "@/components/dashboard/brand-kit-form";

export default function SettingsPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="border-white/10 bg-gray-950/80">
        <CardHeader>
          <CardTitle className="text-white">Brand kit</CardTitle>
        </CardHeader>
        <CardContent>
          <BrandKitForm />
        </CardContent>
      </Card>
      <Card className="border-white/10 bg-gray-950/80">
        <CardHeader>
          <CardTitle className="text-white">Integrations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-gray-300">
          <p>YouTube publishing is currently a stub integration. Connect to configure future publishing.</p>
          <form action="/api/integrations/youtube/connect" method="post">
            <button className="inline-flex h-10 items-center justify-center rounded-md border border-white/10 bg-white/10 px-4 text-sm font-medium text-white hover:bg-white/20">
              Connect YouTube (stub)
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
