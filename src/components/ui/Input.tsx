import { cn } from "@/lib/cn";
import type { InputHTMLAttributes } from "react";
import { forwardRef } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ className, invalid, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "h-10 w-full rounded-lg border bg-white px-3 text-sm text-ink outline-none transition placeholder:text-slate-400",
          invalid
            ? "border-red-300 focus:border-red-500"
            : "border-line focus:border-teal",
          className,
        )}
        {...props}
      />
    );
  },
);
