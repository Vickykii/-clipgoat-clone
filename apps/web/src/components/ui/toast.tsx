import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cn } from "@/lib/utils/cn";

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef<React.ElementRef<typeof ToastPrimitives.Viewport>, React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>>(
  ({ className, ...props }, ref) => (
    <ToastPrimitives.Viewport
      ref={ref}
      className={cn(
        "fixed top-0 right-0 z-[100] flex max-h-screen w-full max-w-sm flex-col gap-2 p-4 sm:bottom-0 sm:top-auto",
        className
      )}
      {...props}
    />
  )
);
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = "group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-lg border border-gray-800 bg-gray-950 p-4 pr-6 text-gray-100 shadow-lg transition-all";

const Toast = React.forwardRef<React.ElementRef<typeof ToastPrimitives.Root>, React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root>>(
  ({ className, ...props }, ref) => (
    <ToastPrimitives.Root ref={ref} className={cn(toastVariants, className)} {...props} />
  )
);
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = ToastPrimitives.Action;
const ToastClose = ToastPrimitives.Close;
const ToastTitle = React.forwardRef<React.ElementRef<typeof ToastPrimitives.Title>, React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>>(
  ({ className, ...props }, ref) => (
    <ToastPrimitives.Title ref={ref} className={cn("text-sm font-semibold", className)} {...props} />
  )
);
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef<React.ElementRef<typeof ToastPrimitives.Description>, React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>>(
  ({ className, ...props }, ref) => (
    <ToastPrimitives.Description ref={ref} className={cn("text-xs text-gray-400", className)} {...props} />
  )
);
ToastDescription.displayName = ToastPrimitives.Description.displayName;

export { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastAction, ToastClose };
