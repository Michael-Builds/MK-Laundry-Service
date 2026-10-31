"use client";

import { cn } from "@/lib/cn";

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

export function RadioGroup({
  name,
  value,
  onChange,
  options,
  className,
}: {
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: RadioOption[];
  className?: string;
}) {
  return (
    <div className={cn("grid gap-2", className)} role="radiogroup">
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <label
            key={option.value}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-xl border px-3.5 py-3 transition",
              selected
                ? "border-teal bg-teal-soft"
                : "border-line bg-white hover:border-line-strong",
            )}
          >
            <span className="relative mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center">
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="peer absolute inset-0 z-10 cursor-pointer opacity-0"
              />
              <span
                className={cn(
                  "h-4 w-4 rounded-full border border-line bg-white",
                  selected && "border-teal border-[5px]",
                )}
              />
            </span>
            <span>
              <span className="block text-sm font-semibold text-ink">
                {option.label}
              </span>
              {option.description ? (
                <span className="mt-0.5 block text-xs text-slate-500">
                  {option.description}
                </span>
              ) : null}
            </span>
          </label>
        );
      })}
    </div>
  );
}
