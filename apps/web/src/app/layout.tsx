import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/styles/globals.css";
import { AppProviders } from "@/lib/providers/app-providers";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: {
    default: "ClipForge",
    template: "%s | ClipForge"
  },
  description: "AI-powered video clipping tool for turning long-form content into viral shorts.",
  icons: {
    icon: "/favicon.ico"
  },
  openGraph: {
    title: "ClipForge",
    description: "Turn YouTube videos and podcasts into viral clips in minutes.",
    url: "https://clipforge.app",
    siteName: "ClipForge"
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-gray-950 text-gray-50 antialiased">
        <AppProviders>
          {children}
          <Toaster />
        </AppProviders>
      </body>
    </html>
  );
}
