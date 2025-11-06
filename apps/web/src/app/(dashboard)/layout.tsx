import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getSession } from "@/lib/auth";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { DashboardHeader } from "@/components/layout/dashboard-header";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <div className="flex min-h-screen bg-gray-950">
      <aside className="hidden w-64 border-r border-white/10 bg-gray-950/90 px-4 py-6 lg:flex">
        <div className="flex w-full flex-col gap-6">
          <div>
            <p className="text-sm text-gray-500">Navigation</p>
            <DashboardNav />
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-xs text-gray-300">
            <p className="font-semibold text-white">Legal Reminder</p>
            <p className="mt-1">
              You must hold the rights to any content you ingest. ClipForge provides tooling only.
            </p>
          </div>
        </div>
      </aside>
      <div className="flex flex-1 flex-col">
        <DashboardHeader user={session.user} workspace={session.workspace} />
        <main className="flex-1 bg-gradient-to-br from-gray-950 via-gray-900 to-black p-6">
          <div className="mx-auto w-full max-w-6xl space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
