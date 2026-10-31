"use client";

import type { DailyBarPoint, StatusSlice } from "@/lib/dashboard";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-line bg-white p-5">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-ink">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      <div className="h-72 w-full">{children}</div>
    </section>
  );
}

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid #E2E8EF",
  boxShadow: "none",
  background: "#ffffff",
};

export function OrdersBarChart({ data }: { data: DailyBarPoint[] }) {
  return (
    <ChartCard
      title="Orders by day"
      description="Order volume and completed revenue for the recent window."
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8EF" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fill: "#64748B", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="left"
            allowDecimals={false}
            tick={{ fill: "#64748B", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fill: "#64748B", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip cursor={{ fill: "#E6F4F1" }} contentStyle={tooltipStyle} />
          <Legend />
          <Bar
            yAxisId="left"
            dataKey="orders"
            name="Orders"
            fill="#0F6B5C"
            radius={[8, 8, 0, 0]}
            maxBarSize={36}
          />
          <Bar
            yAxisId="right"
            dataKey="revenue"
            name="Revenue (GH₵)"
            fill="#142033"
            radius={[8, 8, 0, 0]}
            maxBarSize={36}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function StatusPieChart({ data }: { data: StatusSlice[] }) {
  return (
    <ChartCard
      title="Status mix"
      description="Share of orders across the laundry lifecycle."
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={58}
            outerRadius={92}
            paddingAngle={3}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
