import { cn } from "@/lib/cn";
import type { OrderStatus } from "@/data/types";
import type { ReactNode } from "react";

const statusStyles: Record<OrderStatus, string> = {
  Received: "bg-amber-50 text-status-received",
  Washing: "bg-blue-50 text-status-washing",
  Ready: "bg-teal-soft text-status-ready",
  Completed: "bg-emerald-50 text-status-completed",
  Cancelled: "bg-slate-100 text-status-cancelled",
};

export function Badge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge
      className={cn(
        "transition-colors duration-200",
        statusStyles[status],
      )}
    >
      {status}
    </Badge>
  );
}
