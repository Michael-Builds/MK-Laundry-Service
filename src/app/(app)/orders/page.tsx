"use client";

import { OrderTable } from "@/components/domain/OrderTable";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { PageLoader } from "@/components/ui/PageLoader";
import { SearchInput } from "@/components/ui/SearchInput";
import { Select } from "@/components/ui/Select";
import { Toolbar } from "@/components/ui/Toolbar";
import type { Order, OrderStatus } from "@/data/types";
import { useBootLoading } from "@/hooks/useBootLoading";
import { api } from "@/lib/api-client";
import { PackagePlus } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";

const statuses: Array<OrderStatus | "All"> = [
  "All",
  "Received",
  "Washing",
  "Ready",
  "Completed",
  "Cancelled",
];

function OrdersPageContent() {
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status");
  const [orders, setOrders] = useState<Order[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<OrderStatus | "All">("All");

  const boot = useCallback(async () => {
    const data = await api<{ orders: Order[] }>("/api/orders");
    setOrders(data.orders);
  }, []);
  const ready = useBootLoading(boot);

  useEffect(() => {
    if (statusParam && statuses.includes(statusParam as OrderStatus)) {
      setStatus(statusParam as OrderStatus);
    }
  }, [statusParam]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders
      .filter((order) => (status === "All" ? true : order.status === status))
      .filter((order) => {
        if (!q) return true;
        return (
          order.code.toLowerCase().includes(q) ||
          order.id.toLowerCase().includes(q) ||
          order.customerName.toLowerCase().includes(q) ||
          order.phone.includes(q)
        );
      });
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
      <Topbar
        title="Orders"
        eyebrow="Operations"
        actions={
          <Link href="/orders/new">
            <Button size="sm" icon={<PackagePlus className="h-4 w-4" />}>
              New order
            </Button>
          </Link>
        }
      />

      <Toolbar>
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
      </Toolbar>

      <OrderTable orders={filtered} />
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <div>
          <Topbar title="Orders" eyebrow="Operations" />
          <PageLoader label="Loading orders..." compact />
        </div>
      }
    >
      <OrdersPageContent />
    </Suspense>
  );
}
