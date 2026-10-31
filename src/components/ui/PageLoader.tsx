import { cn } from "@/lib/cn";
import { Spinner } from "./Spinner";

export function PageLoader({
  label = "Loading...",
  className,
  compact = false,
}: {
  label?: string;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 text-sm text-slate-500",
        compact ? "py-16" : "min-h-[50vh]",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <Spinner className="h-8 w-8" />
      <p>{label}</p>
    </div>
  );
}

export function ScreenLoader({
  label = "Loading...",
}: {
  label?: string;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-mist text-sm text-slate-500">
      <Spinner className="h-9 w-9" />
      <p>{label}</p>
    </div>
  );
}
