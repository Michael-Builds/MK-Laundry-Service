"use client";

import { cn } from "@/lib/cn";
import { Check, ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  invalid?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
  "aria-label"?: string;
}

export function Select({
  value,
  onChange,
  options,
  placeholder = "Select an option",
  invalid = false,
  disabled = false,
  className,
  id,
  name,
  "aria-label": ariaLabel,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative w-full", className)}>
      {name ? <input type="hidden" name={name} value={value} /> : null}
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "flex h-10 w-full items-center justify-between gap-3 rounded-lg border bg-white px-3 text-left text-sm outline-none transition",
          invalid
            ? "border-red-300 focus:border-red-500"
            : open
              ? "border-teal"
              : "border-line hover:border-line-strong focus:border-teal",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        <span
          className={cn(
            "min-w-0 flex-1 truncate",
            selected ? "font-medium text-ink" : "text-slate-400",
          )}
        >
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-slate-400 transition",
            open && "rotate-180 text-teal",
          )}
        />
      </button>

      {open ? (
        <div
          id={listId}
          role="listbox"
          className="absolute z-40 mt-1.5 max-h-64 w-full overflow-auto rounded-xl border border-line bg-white p-1"
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                disabled={option.disabled}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition",
                  isSelected ? "bg-teal-soft text-teal" : "text-ink hover:bg-mist",
                  option.disabled && "cursor-not-allowed opacity-50",
                )}
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{option.label}</span>
                  {option.description ? (
                    <span className="mt-0.5 block text-xs text-slate-500">
                      {option.description}
                    </span>
                  ) : null}
                </span>
                {isSelected ? <Check className="mt-0.5 h-4 w-4 shrink-0" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export function SegmentedControl({
  value,
  onChange,
  options,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-2 rounded-xl border border-line bg-mist p-1",
        options.length === 2 ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2",
        className,
      )}
      role="radiogroup"
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-lg px-3 py-2.5 text-sm font-semibold transition",
              selected
                ? "border border-teal/20 bg-white text-teal"
                : "border border-transparent text-slate-500 hover:text-ink",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
