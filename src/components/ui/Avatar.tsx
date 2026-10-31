import { cn } from "@/lib/cn";

export function Avatar({
  name,
  size = "md",
  className,
}: {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const initial = name?.charAt(0)?.toUpperCase() || "?";
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-teal font-bold text-white",
        size === "sm" && "h-8 w-8 text-xs",
        size === "md" && "h-9 w-9 text-sm",
        size === "lg" && "h-11 w-11 text-base",
        className,
      )}
      aria-hidden
    >
      {initial}
    </span>
  );
}
