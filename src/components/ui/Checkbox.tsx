"use client";

import { cn } from "@/lib/cn";
import { Check } from "lucide-react";
import type { InputHTMLAttributes } from "react";

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

export function Checkbox({
  className,
  label,
  id,
  checked,
  ...props
}: CheckboxProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "inline-flex cursor-pointer items-center gap-2.5 text-sm text-ink",
        className,
      )}
    >
      <span className="relative inline-flex h-5 w-5 shrink-0 items-center justify-center">
        <input
          id={id}
          type="checkbox"
          className="peer absolute inset-0 z-10 cursor-pointer opacity-0"
          checked={checked}
          {...props}
        />
        <span
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded-md border border-line bg-white transition peer-focus-visible:border-teal",
            checked && "border-teal bg-teal text-white",
          )}
        >
          {checked ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : null}
        </span>
      </span>
      {label}
    </label>
  );
}
