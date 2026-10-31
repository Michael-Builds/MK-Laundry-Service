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

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex w-full flex-col gap-3 sm:flex-1 sm:flex-row sm:flex-wrap sm:items-center">
          <SearchInput
            className="max-w-none sm:max-w-sm"
            placeholder="Search customer, phone, or order ID"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <Select
            className="w-full sm:max-w-[180px]"
            value={status}
            onChange={(value) => setStatus(value as OrderStatus | "All")}
            options={statuses.map((item) => ({
              value: item,
              label: item === "All" ? "All statuses" : item,
            }))}
            aria-label="Filter by status"
          />
        </div>
        <Link href="/orders/new" className="w-full sm:w-auto">
          <Button icon={<PackagePlus className="h-4 w-4" />} fullWidth className="sm:w-auto">
            New order
          </Button>
        </Link>
      </div>

      <OrderTable orders={filtered} />
    </div>
  );
}
