import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/* 輕量 Toast 系統（取代 sonner + radix toast，統一品牌風格） */

type ToastVariant = "default" | "success" | "destructive";

interface ToastItem {
  id: number;
  title?: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (opts: { title?: string; description?: string; variant?: ToastVariant }) => void;
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);

let nextId = 1;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<ToastItem[]>([]);

  const dismiss = React.useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = React.useCallback<ToastContextValue["toast"]>(
    ({ title, description, variant = "default" }) => {
      const id = nextId++;
      setItems((prev) => [...prev.slice(-3), { id, title, description, variant }]);
      setTimeout(() => dismiss(id), 4000);
    },
    [dismiss],
  );

  const value = React.useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-20 md:bottom-6 left-1/2 z-[100] flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-lg animate-fade-in glass-strong",
              item.variant === "destructive" && "border-destructive/40",
              item.variant === "success" && "border-success/40",
            )}
          >
            <div
              className={cn(
                "mt-1 h-2 w-2 shrink-0 rounded-full",
                item.variant === "destructive" ? "bg-destructive" : item.variant === "success" ? "bg-success" : "bg-primary",
              )}
            />
            <div className="flex-1 min-w-0">
              {item.title && <p className="text-sm font-semibold">{item.title}</p>}
              {item.description && <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>}
            </div>
            <button
              type="button"
              onClick={() => dismiss(item.id)}
              className="rounded-md p-0.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}
