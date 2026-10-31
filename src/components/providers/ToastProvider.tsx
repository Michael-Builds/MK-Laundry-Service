"use client";

import { Toast, type ToastTone } from "@/components/ui/Toast";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface ToastContextValue {
  showToast: (message: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<ToastTone>("info");
  const [visible, setVisible] = useState(false);

  const showToast = useCallback((nextMessage: string, nextTone: ToastTone = "info") => {
    setMessage(nextMessage);
    setTone(nextTone);
    setVisible(true);
    window.setTimeout(() => setVisible(false), 2600);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toast message={message} tone={tone} visible={visible} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
