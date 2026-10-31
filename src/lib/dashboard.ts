import { formatCurrency } from "@/data/orders";
import type { Order, OrderStatus } from "@/data/types";

export type StatTone = "default" | "accent";

export interface DashboardStat {
  id: string;
  label: string;
  value: string | number;
  hint: string;
  icon: "clock" | "sparkles" | "check" | "wallet";
  accent?: boolean;
}

export interface StatusSlice {
  name: OrderStatus;
  value: number;
  fill: string;
}

export interface DailyBarPoint {
  day: string;
  orders: number;
  revenue: number;
}

const statusColors: Record<OrderStatus, string> = {
  Received: "#F59E0B",
  Washing: "#3B82F6",
  Ready: "#0F6B5C",
  Completed: "#16A34A",
  Cancelled: "#94A3B8",
};

export function buildDashboardStats(orders: Order[]): DashboardStat[] {
  const pending = orders.filter(
    (order) => !["Completed", "Cancelled"].includes(order.status),
  ).length;
  const ready = orders.filter((order) => order.status === "Ready").length;
  const completed = orders.filter((order) => order.status === "Completed");
  const revenue = completed.reduce((sum, order) => sum + order.total, 0);

  return [
    {
      id: "in-progress",
      label: "In progress",
      value: pending,
      hint: "Received + washing + ready",
      icon: "clock",
    },
    {
      id: "ready",
      label: "Ready for pickup",
      value: ready,
      hint: "Waiting on customer pickup",
      icon: "sparkles",
      accent: true,
    },
    {
      id: "completed",
      label: "Completed",
      value: completed.length,
      hint: "Closed successfully",
      icon: "check",
    },
    {
      id: "revenue",
      label: "Completed revenue",
      value: formatCurrency(revenue),
      hint: "From completed orders",
      icon: "wallet",
    },
  ];
}

export function buildStatusPieData(orders: Order[]): StatusSlice[] {
  const counts = orders.reduce(
    (acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    },
    {} as Record<OrderStatus, number>,
  );

  return (Object.keys(statusColors) as OrderStatus[])
    .map((status) => ({
      name: status,
      value: counts[status] || 0,
      fill: statusColors[status],
    }))
    .filter((slice) => slice.value > 0);
}

export function buildDailyBarData(orders: Order[]): DailyBarPoint[] {
  const map = new Map<string, DailyBarPoint>();

  for (const order of orders) {
    const day = order.createdAt.slice(0, 10);
    const current = map.get(day) || { day, orders: 0, revenue: 0 };
    current.orders += 1;
    if (order.status === "Completed") {
      current.revenue += order.total;
    }
    map.set(day, current);
  }

  return [...map.values()]
    .sort((a, b) => a.day.localeCompare(b.day))
    .slice(-7)
    .map((point) => ({
      ...point,
      day: point.day.slice(5),
    }));
}
