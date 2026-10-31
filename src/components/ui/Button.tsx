import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Spinner } from "./Spinner";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
  loadingText?: string;
}

const variants: Record<Variant, string> = {
  primary:
    "border border-teal bg-teal text-white hover:border-teal-dark hover:bg-teal-dark disabled:border-teal/50 disabled:bg-teal/50",
  secondary:
    "border border-teal/25 bg-teal-soft text-teal hover:border-teal/40 hover:bg-[#d7ebe6] disabled:opacity-50",
  ghost:
    "border border-transparent bg-transparent text-ink-muted hover:border-line hover:bg-mist-slate disabled:opacity-50",
  danger:
    "border border-red-200 bg-[#fef3f2] text-[var(--danger)] hover:border-red-300 hover:bg-[#fee4e2] disabled:opacity-50",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-11 px-5 text-[15px] gap-2",
};

const spinnerSize: Record<Size, string> = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-4 w-4",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  icon,
  fullWidth,
  loading = false,
  loadingText,
  children,
  type = "button",
  disabled,
  ...props
}: ButtonProps) {
  const spinnerTone =
    variant === "primary" ? "white" : variant === "danger" ? "current" : "teal";

  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading}
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-semibold transition-colors focus-visible:outline-none focus-visible:border-teal disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {loading ? (
        <Spinner className={spinnerSize[size]} tone={spinnerTone} />
      ) : (
        icon
      )}
      {loading && loadingText ? loadingText : children}
    </button>
  );
}
