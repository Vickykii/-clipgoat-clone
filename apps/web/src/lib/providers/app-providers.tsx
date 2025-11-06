"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, type ReactNode } from "react";
import { ThemeProvider } from "@/lib/providers/theme-provider";
import { ToastProvider } from "@/lib/providers/toast-context";

export function AppProviders({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1
      }
    }
  }));

  return (
    <ThemeProvider>
      <ToastProvider>
        <QueryClientProvider client={client}>
          {children}
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
