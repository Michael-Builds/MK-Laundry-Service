"use client";

import { cn } from "@/lib/cn";
import { CalendarDays } from "lucide-react";
import type { InputHTMLAttributes } from "react";
import { forwardRef } from "react";

export const DateInput = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }
>(function DateInput({ className, invalid, ...props }, ref) {
  return (
    <div className={cn("relative w-full", className)}>
      <CalendarDays className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        ref={ref}
        type="date"
        className={cn(
          "h-10 w-full rounded-lg border bg-white py-2 pr-3 pl-10 text-sm text-ink outline-none transition",
          invalid
            ? "border-red-300 focus:border-red-500"
            : "border-line focus:border-teal",
        )}
        {...props}
      />
    </div>
  );
});
