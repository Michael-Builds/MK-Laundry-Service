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
      onChange={(event) => onChange(event.target.value as OrderStatus)}
    >
      {statuses.map((status) => (
        <option key={status} value={status}>
          {status}
        </option>
      ))}
    </Select>
  );
}
