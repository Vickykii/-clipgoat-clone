import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-black px-6 py-10">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black/40 p-10 shadow-xl">
        {children}
      </div>
    </div>
  );
}
