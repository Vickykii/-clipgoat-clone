"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { nanoid } from "nanoid";

type ToastRecord = {
  id: string;
  title?: string;
  description?: string;
  action?: { label: string; onClick?: () => void };
};

type ToastContextValue = {
  toasts: ToastRecord[];
  toast: (toast: Omit<ToastRecord, "id">) => void;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback((data: Omit<ToastRecord, "id">) => {
    const id = nanoid();
    setToasts((prev) => [...prev, { ...data, id }]);
    setTimeout(() => dismiss(id), 6000);
  }, [dismiss]);

  return <ToastContext.Provider value={{ toasts, toast, dismiss }}>{children}</ToastContext.Provider>;
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
};
