"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export type ToastType = "success" | "error";

export interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (toast: Omit<ToastItem, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((previous) => previous.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: Omit<ToastItem, "id">) => {
      const id = Date.now();
      setToasts((previous) => [...previous, { ...toast, id }]);
      if (typeof window !== "undefined") {
        window.setTimeout(() => {
          removeToast(id);
        }, 4000);
      }
    },
    [removeToast],
  );

  const contextValue = useMemo<ToastContextValue>(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="pointer-events-none fixed top-4 right-4 z-50 flex w-full max-w-sm flex-col gap-3">
        {toasts.map((toast) => {
          const tone = toast.type === "success" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-700";
          const shadow = toast.type === "success" ? "shadow-emerald-200" : "shadow-rose-200";
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start justify-between gap-4 rounded-2xl px-4 py-3 text-sm font-medium shadow-lg ${tone} ${shadow}`}
              role="status"
            >
              <span>{toast.message}</span>
              <button
                type="button"
                aria-label="Dismiss notification"
                onClick={() => removeToast(toast.id)}
                className="text-xs font-semibold uppercase tracking-wide text-slate-500 transition hover:text-slate-700"
              >
                Close
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
