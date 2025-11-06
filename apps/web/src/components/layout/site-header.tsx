"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-white">CF</span>
          ClipForge
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-gray-300 md:flex">
          <Link href="#features" className="hover:text-white">
            Features
          </Link>
          <Link href="#pricing" className="hover:text-white">
            Pricing
          </Link>
          <Link href="#faq" className="hover:text-white">
            FAQ
          </Link>
          <Link href="/legal" className="hover:text-white">
            Legal
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" className="text-gray-300 hover:text-white">
            <Link href={isDashboard ? "/dashboard" : "/auth/signin"}>{isDashboard ? "Dashboard" : "Sign in"}</Link>
          </Button>
          <Button asChild>
            <Link href="/auth/signin">Start for free</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
