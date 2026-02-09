"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "info" | "error";

type ToastRecord = {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
};

type ShowToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;
};

type ToastContextValue = {
  showToast: (input: ShowToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_TIMEOUT_MS = 3200;

const iconByVariant: Record<ToastVariant, React.ComponentType<{ className?: string }>> = {
  success: CheckCircle2,
  info: Info,
  error: TriangleAlert,
};

const styleByVariant: Record<ToastVariant, string> = {
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  info: "border-primary/40 bg-primary/10 text-primary",
  error: "border-destructive/40 bg-destructive/10 text-destructive",
};

type ToastProviderProps = {
  children: React.ReactNode;
};

export const ToastProvider = ({ children }: ToastProviderProps): React.ReactElement => {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({ title, description, variant = "info" }: ShowToastInput) => {
      const id = Date.now() + Math.floor(Math.random() * 1000);
      setToasts((current) => [...current, { id, title, description, variant }]);
      window.setTimeout(() => {
        removeToast(id);
      }, TOAST_TIMEOUT_MS);
    },
    [removeToast],
  );

  const contextValue = useMemo(
    () => ({
      showToast,
    }),
    [showToast],
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div
        className="pointer-events-none fixed top-4 right-4 z-[60] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2 sm:w-full"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((toast) => {
          const Icon = iconByVariant[toast.variant];
          return (
            <div
              key={toast.id}
              className={cn(
                "toast-item pointer-events-auto rounded-xl border px-4 py-3 shadow-lg backdrop-blur",
                styleByVariant[toast.variant],
              )}
              role="status"
            >
              <div className="flex items-start gap-2">
                <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{toast.title}</p>
                  {toast.description ? <p className="mt-0.5 text-xs opacity-90">{toast.description}</p> : null}
                </div>
                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  className="rounded-md p-1 text-current/80 transition hover:bg-background/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Dismiss notification"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider.");
  }

  return context;
};
