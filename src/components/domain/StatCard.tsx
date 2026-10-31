import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  hint,
  icon,
  accent,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <p className="text-sm text-slate-500">{label}</p>
        {icon ? (
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-teal/20 bg-teal-soft text-teal">
            {icon}
          </span>
        ) : null}
      </div>
      <p
        className={cn(
          "text-3xl font-semibold tracking-tight",
          accent ? "text-teal" : "text-ink",
        )}
      >
        {value}
      </p>
      {hint ? <p className="mt-2 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}
