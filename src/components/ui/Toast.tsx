"use client";

import { cn } from "@/lib/cn";
import { CheckCircle2, Info, XCircle } from "lucide-react";

export type ToastTone = "success" | "info" | "error";

export function Toast({
  message,
  tone = "info",
  visible,
}: {
  message: string;
  tone?: ToastTone;
  visible: boolean;
}) {
  if (!visible) return null;

  const Icon =
    tone === "success" ? CheckCircle2 : tone === "error" ? XCircle : Info;

  return (
    <div
      className={cn(
        "fixed right-6 top-6 z-[60] flex max-w-sm items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium text-white animate-slide-in",
        tone === "success" && "border-teal-dark bg-teal",
        tone === "info" && "border-ink-soft bg-ink",
        tone === "error" && "border-red-800 bg-[var(--danger)]",
      )}
      role="status"
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
