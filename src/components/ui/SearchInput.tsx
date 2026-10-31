import { cn } from "@/lib/cn";
import { Search } from "lucide-react";
import type { InputHTMLAttributes } from "react";

export function SearchInput({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={cn("relative w-full max-w-sm", className)}>
      <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        className="h-10 w-full rounded-lg border border-line bg-white pr-3 pl-9 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-teal"
        {...props}
      />
    </div>
  );
}
