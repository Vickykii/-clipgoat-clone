"use client";

import { useToast } from "@/lib/providers/toast-context";
import { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <ToastProvider>
      {toasts.map((toast) => (
        <Toast key={toast.id} open onOpenChange={(open) => !open && dismiss(toast.id)}>
          <div className="grid gap-1">
            {toast.title ? <ToastTitle>{toast.title}</ToastTitle> : null}
            {toast.description ? <ToastDescription>{toast.description}</ToastDescription> : null}
          </div>
          {toast.action ? (
            <Button size="sm" variant="ghost" onClick={() => toast.action?.onClick?.()}>
              {toast.action.label}
            </Button>
          ) : null}
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}
