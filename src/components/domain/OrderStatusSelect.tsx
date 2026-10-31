"use client";

import type { OrderStatus } from "@/data/types";
import { Select } from "@/components/ui/Select";

const statuses: OrderStatus[] = [
  "Received",
  "Washing",
  "Ready",
  "Completed",
  "Cancelled",
];

export function OrderStatusSelect({
  value,
  onChange,
}: {
  value: OrderStatus;
  onChange: (status: OrderStatus) => void;
}) {
  return (
    <Select
      value={value}
      onChange={(next) => onChange(next as OrderStatus)}
      options={statuses.map((status) => ({
        value: status,
        label: status,
      }))}
      aria-label="Order status"
    />
  );
}
