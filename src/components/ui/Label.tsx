import { cn } from "@/lib/cn";
import type { LabelHTMLAttributes } from "react";

export function Label({
  className,
  required,
  children,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }) {
  return (
    <label
      className={cn(
        "mb-1.5 block text-sm font-semibold text-ink-muted",
        className,
      )}
      {...props}
    >
      {children}
      {required ? <span className="ml-1 text-[var(--danger)]">*</span> : null}
    </label>
  );
}
