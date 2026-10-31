import { cn } from "@/lib/cn";
import type { InputHTMLAttributes } from "react";
import { forwardRef } from "react";

export const DateInput = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }
>(function DateInput({ className, invalid, ...props }, ref) {
  return (
    <input
      ref={ref}
      type="date"
      className={cn(
        "h-10 w-full rounded-lg border bg-white px-3 text-sm text-ink outline-none transition",
        invalid
          ? "border-red-300 focus:border-red-500"
          : "border-line focus:border-teal",
        className,
      )}
      {...props}
    />
  );
});
