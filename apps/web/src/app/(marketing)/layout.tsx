import type { ReactNode } from "react";
import { SiteHeader } from "@/components/layout/site-header";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-white/10 bg-gray-950/80 py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 text-sm text-gray-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} ClipForge. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="mailto:hello@clipforge.app" className="hover:text-white">
              Contact
            </a>
            <a href="/legal" className="hover:text-white">
              Legal
            </a>
            <a href="https://status.clipforge.app" className="hover:text-white">
              Status
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
