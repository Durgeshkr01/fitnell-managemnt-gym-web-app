"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { logAction } from "@/lib/firebase/log-action";

type ActionContextValue = {
  runAction: (action: string, metadata?: Record<string, unknown>) => void;
};

type Toast = {
  id: string;
  message: string;
};

const ActionContext = createContext<ActionContextValue | null>(null);

const TOAST_DURATION_MS = 3200;

function createToastId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function useAction() {
  const context = useContext(ActionContext);
  if (!context) {
    throw new Error("useAction must be used within ActionProvider");
  }
  return context;
}

export default function ActionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const runAction = useCallback(
    (action: string, metadata?: Record<string, unknown>) => {
      const toastId = createToastId();
      const message = action ? `${action} queued` : "Action queued";

      setToasts((prev) => [...prev, { id: toastId, message }]);
      void logAction(action || "Action", metadata);

      window.setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== toastId));
      }, TOAST_DURATION_MS);
    },
    []
  );

  const value = useMemo(() => ({ runAction }), [runAction]);

  return (
    <ActionContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex w-80 flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="glass-panel rounded-xl px-4 py-3 text-xs text-slate-200"
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ActionContext.Provider>
  );
}
