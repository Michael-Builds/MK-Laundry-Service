"use client";

import { OrderTable } from "@/components/domain/OrderTable";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { PageLoader } from "@/components/ui/PageLoader";
import { SearchInput } from "@/components/ui/SearchInput";
import { Select } from "@/components/ui/Select";
import type { Order, OrderStatus } from "@/data/types";
import { useBootLoading } from "@/hooks/useBootLoading";
import { getOrders } from "@/lib/store";
import { PackagePlus } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

const statuses: Array<OrderStatus | "All"> = [
  "All",
  "Received",
  "Washing",
  "Ready",
  "Completed",
  "Cancelled",
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<OrderStatus | "All">("All");

  const boot = useCallback(() => {
    setOrders(getOrders());
  }, []);
  const ready = useBootLoading(boot);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders
      .filter((order) => (status === "All" ? true : order.status === status))
      .filter((order) => {
        if (!q) return true;
        return (
          order.id.toLowerCase().includes(q) ||
          order.customerName.toLowerCase().includes(q) ||
          order.phone.includes(q)
        );
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [orders, query, status]);

  if (!ready) {
    return (
      <div>
        <Topbar title="Orders" eyebrow="Operations" />
        <PageLoader label="Loading orders..." compact />
      </div>
    );
  }

  return (
    <div>
      <Topbar title="Orders" eyebrow="Operations" />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <SearchInput
            placeholder="Search customer, phone, or order ID"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <Select
            className="max-w-[180px]"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as OrderStatus | "All")
            }
          >
            {statuses.map((item) => (
              <option key={item} value={item}>
                {item === "All" ? "All statuses" : item}
              </option>
            ))}
          </Select>
        </div>
        <Link href="/orders/new">
          <Button icon={<PackagePlus className="h-4 w-4" />}>New order</Button>
        </Link>
      </div>

      <OrderTable orders={filtered} />
    </div>
  );
}
