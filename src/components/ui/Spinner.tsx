import { cn } from "@/lib/cn";

export function Spinner({
  className,
  tone = "teal",
}: {
  className?: string;
  tone?: "teal" | "white" | "ink" | "current";
}) {
  const tones = {
    teal: "border-teal/25 border-t-teal",
    white: "border-white/30 border-t-white",
    ink: "border-ink/20 border-t-ink",
    current: "border-red-200 border-t-[var(--danger)]",
  };

  return (
    <span
      className={cn(
        "inline-block h-5 w-5 animate-spin rounded-full border-2",
        tones[tone],
        className,
      )}
      role="status"
      aria-label="Loading"
    />
  );
}
