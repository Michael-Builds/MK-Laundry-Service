"use client";

import { formatCurrency } from "@/data/orders";
import type { Order } from "@/data/types";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { ClipboardList, Eye } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

export function OrderTable({ orders }: { orders: Order[] }) {
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
        cell: (order) => (
          <div>
            <p className="font-semibold text-ink">{order.customerName}</p>
            <p className="text-xs text-slate-500">{order.phone}</p>
          </div>
        ),
      },
      {
        id: "delivery",
        header: "Delivery",
        hideOnMobile: true,
        cell: (order) => order.deliveryDate,
      },
      {
        id: "payment",
        header: "Payment",
        hideOnMobile: true,
        cell: (order) => order.payment,
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
      {
        id: "status",
        header: "Status",
        cell: (order) => <StatusBadge status={order.status} />,
      },
      {
        id: "action",
        header: "Action",
        headerClassName: "text-right",
        className: "text-right",
        cell: (order) => (
          <Link
            href={`/orders/${order.id}`}
            onClick={(event) => event.stopPropagation()}
          >
            <Button
              variant="secondary"
              size="sm"
              icon={<Eye className="h-3.5 w-3.5" />}
            >
              <span className="hidden sm:inline">View</span>
            </Button>
          </Link>
        ),
      },
    ],
    [],
  );

  return (
    <DataTable
      data={orders}
      columns={columns}
      getRowId={(order) => order.id}
      emptyIcon={<ClipboardList className="h-5 w-5" />}
      emptyTitle="No orders found"
      emptyDescription="Try adjusting your filters or create a new order."
      emptyAction={
        <Link href="/orders/new">
          <Button>New order</Button>
        </Link>
      }
      pageSize={8}
    />
  );
}
