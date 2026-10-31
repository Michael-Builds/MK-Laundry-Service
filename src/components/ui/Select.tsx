import { cn } from "@/lib/cn";
import type { SelectHTMLAttributes } from "react";
import { forwardRef } from "react";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ className, invalid, children, ...props }, ref) {
    return (
      <select
        ref={ref}
        className={cn(
          "h-10 w-full rounded-lg border bg-white px-3 text-sm text-ink outline-none transition",
          invalid
            ? "border-red-300 focus:border-red-500"
            : "border-line focus:border-teal",
          className,
        )}
        {...props}
      >
        {children}
      </select>
    );
  },
);
