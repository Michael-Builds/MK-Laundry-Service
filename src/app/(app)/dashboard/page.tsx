"use client";

import {
  OrdersBarChart,
  StatusPieChart,
} from "@/components/domain/DashboardCharts";
import { OrderTable } from "@/components/domain/OrderTable";
import { StatCard } from "@/components/domain/StatCard";
import { Topbar } from "@/components/layout/Topbar";
import { useSession } from "@/components/providers/SessionProvider";
import { Button } from "@/components/ui/Button";
import { PageLoader } from "@/components/ui/PageLoader";
import type { Order } from "@/data/types";
import { useBootLoading } from "@/hooks/useBootLoading";
import {
  buildDailyBarData,
  buildDashboardStats,
  buildStatusPieData,
} from "@/lib/dashboard";
import { getOrders } from "@/lib/store";
import {
  CheckCircle2,
  Clock3,
  PackagePlus,
  Sparkles,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

const statIcons = {
  clock: <Clock3 className="h-4 w-4" />,
  sparkles: <Sparkles className="h-4 w-4" />,
  check: <CheckCircle2 className="h-4 w-4" />,
  wallet: <Wallet className="h-4 w-4" />,
} as const;

export default function DashboardPage() {
  const { user } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);

  const boot = useCallback(() => {
    setOrders(getOrders());
  }, []);

  const ready = useBootLoading(boot);

  const stats = useMemo(() => buildDashboardStats(orders), [orders]);
  const barData = useMemo(() => buildDailyBarData(orders), [orders]);
  const pieData = useMemo(() => buildStatusPieData(orders), [orders]);

  const allOrders = useMemo(
    () =>
      [...orders].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [orders],
  );

  if (!ready) {
    return (
      <div>
        <Topbar title="Dashboard" eyebrow="Overview" />
        <PageLoader label="Loading dashboard..." compact />
      </div>
    );
  }

  return (
    <div>
      <Topbar
        title="Dashboard"
        eyebrow="Overview"
        actions={
          <Link href="/orders/new">
            <Button size="sm" icon={<PackagePlus className="h-4 w-4" />}>
              New order
            </Button>
          </Link>
        }
      />

      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-line bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div>
          <p className="text-lg font-semibold text-ink">
            Welcome back, {user?.fullName}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Live view of every ticket on the floor - filter further on Orders if you need it.
          </p>
        </div>
        <Link href="/orders">
          <Button variant="secondary" size="sm">
            Open orders
          </Button>
        </Link>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.id}
            label={stat.label}
            value={stat.value}
            hint={stat.hint}
            accent={stat.accent}
            icon={statIcons[stat.icon]}
          />
        ))}
      </div>

      <section className="mb-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-ink">Insights</h2>
          <p className="mt-1 text-sm text-slate-500">
            Trends for managers - secondary to live floor work.
          </p>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          <OrdersBarChart data={barData} />
          <StatusPieChart data={pieData} />
        </div>
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-ink">Orders</h2>
            <p className="mt-1 text-sm text-slate-500">
              All statuses in one place, newest first.
            </p>
          </div>
          <Link href="/orders">
            <Button variant="ghost" size="sm">
              Manage orders
            </Button>
          </Link>
        </div>
        <OrderTable orders={allOrders} />
      </section>
    </div>
  );
}
