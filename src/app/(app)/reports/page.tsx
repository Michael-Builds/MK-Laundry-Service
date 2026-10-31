"use client";

import { StatCard } from "@/components/domain/StatCard";
import { Topbar } from "@/components/layout/Topbar";
import { useToast } from "@/components/providers/ToastProvider";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { DateInput } from "@/components/ui/DateInput";
import { Field } from "@/components/ui/Field";
import { formatCurrency } from "@/data/orders";
import type { Order } from "@/data/types";
import { PageLoader } from "@/components/ui/PageLoader";
import { useBootLoading } from "@/hooks/useBootLoading";
import { getOrders } from "@/lib/store";
import { wait } from "@/lib/wait";
import { ClipboardList, Download, Wallet } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

export default function ReportsPage() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [from, setFrom] = useState("2026-10-01");
  const [to, setTo] = useState("2026-11-30");
  const [confirmExport, setConfirmExport] = useState(false);
  const [exporting, setExporting] = useState(false);

  const boot = useCallback(() => {
    setOrders(getOrders());
  }, []);
  const ready = useBootLoading(boot);

  const filtered = useMemo(() => {
    return orders.filter((order) => {
      const day = order.createdAt.slice(0, 10);
      return day >= from && day <= to;
    });
  }, [orders, from, to]);

  const completed = filtered.filter((order) => order.status === "Completed");
  const revenue = completed.reduce((sum, order) => sum + order.total, 0);
  const cancelled = filtered.filter((order) => order.status === "Cancelled").length;

  const exportCsv = async () => {
    setExporting(true);
    await wait();
    const rows = [
      ["Order ID", "Customer", "Phone", "Delivery", "Payment", "Status", "Total"],
      ...filtered.map((order) => [
        order.id,
        order.customerName,
        order.phone,
        order.deliveryDate,
        order.payment,
        order.status,
        String(order.total),
      ]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `mk-laundry-report-${from}-to-${to}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    setExporting(false);
    setConfirmExport(false);
    showToast("Report downloaded", "success");
  };

  const columns = useMemo<DataTableColumn<Order>[]>(
    () => [
      {
        id: "order",
        header: "Order",
        cell: (order) => (
          <span className="font-semibold text-ink">{order.id}</span>
        ),
      },
      {
        id: "customer",
        header: "Customer",
        cell: (order) => order.customerName,
      },
      {
        id: "created",
        header: "Created",
        cell: (order) => order.createdAt.slice(0, 10),
      },
      {
        id: "payment",
        header: "Payment",
        hideOnMobile: true,
        cell: (order) => order.payment,
      },
      {
        id: "status",
        header: "Status",
        cell: (order) => <StatusBadge status={order.status} />,
      },
      {
        id: "total",
        header: "Total",
        cell: (order) => (
          <span className="font-semibold text-ink">
            {formatCurrency(order.total)}
          </span>
        ),
      },
    ],
    [],
  );

  if (!ready) {
    return (
      <div>
        <Topbar title="Reports" eyebrow="Insights" />
        <PageLoader label="Loading reports..." compact />
      </div>
    );
  }

  return (
    <div>
      <Topbar title="Reports" eyebrow="Insights" />

      <div className="mb-6 rounded-2xl border border-line bg-white p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid w-full gap-3 sm:grid-cols-2 lg:max-w-xl">
            <Field label="From" htmlFor="from">
              <DateInput
                id="from"
                value={from}
                onChange={(event) => setFrom(event.target.value)}
              />
            </Field>
            <Field label="To" htmlFor="to">
              <DateInput
                id="to"
                value={to}
                onChange={(event) => setTo(event.target.value)}
              />
            </Field>
          </div>
          <Button
            variant="secondary"
            icon={<Download className="h-4 w-4" />}
            onClick={() => setConfirmExport(true)}
            className="w-full shrink-0 lg:w-auto"
          >
            Export CSV
          </Button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Orders in range" value={filtered.length} />
        <StatCard label="Completed" value={completed.length} accent />
        <StatCard label="Cancelled" value={cancelled} />
        <StatCard
          label="Revenue"
          value={formatCurrency(revenue)}
          icon={<Wallet className="h-4 w-4" />}
        />
      </div>

      <DataTable
        data={filtered}
        columns={columns}
        getRowId={(order) => order.id}
        emptyIcon={<ClipboardList className="h-5 w-5" />}
        emptyTitle="No orders in this range"
        emptyDescription="Adjust the date filters to see report rows."
      />

      <ConfirmDialog
        open={confirmExport}
        onClose={() => setConfirmExport(false)}
        onConfirm={exportCsv}
        title="Export report?"
        description={`Download a CSV for ${filtered.length} order${filtered.length === 1 ? "" : "s"} between ${from} and ${to}.`}
        confirmLabel="Download CSV"
        tone="primary"
        loading={exporting}
      />
    </div>
  );
}
