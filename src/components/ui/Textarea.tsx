import { cn } from "@/lib/cn";
import type { TextareaHTMLAttributes } from "react";
import { forwardRef } from "react";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, invalid, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(
          "min-h-[96px] w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-slate-400",
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
