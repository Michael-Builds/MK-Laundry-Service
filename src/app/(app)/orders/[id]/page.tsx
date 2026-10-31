"use client";

import { InvoicePreview } from "@/components/domain/InvoicePreview";
import { OrderStatusSelect } from "@/components/domain/OrderStatusSelect";
import { Topbar } from "@/components/layout/Topbar";
import { useToast } from "@/components/providers/ToastProvider";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Field } from "@/components/ui/Field";
import { employees } from "@/data/employees";
import type { Order, OrderStatus } from "@/data/types";
import { getOrders, updateOrderStatus } from "@/lib/store";
import { wait } from "@/lib/wait";
import { ArrowLeft, Printer } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PageLoader } from "@/components/ui/PageLoader";

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const { showToast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoading(true);
      const found = getOrders().find((item) => item.id === params.id) ?? null;
      await wait(300);
      if (!alive) return;
      setOrder(found);
      setLoading(false);
    };
    void load();
    return () => {
      alive = false;
    };
  }, [params.id]);

  if (loading) {
    return (
      <div>
        <Topbar title="Order" eyebrow="Operations" />
        <PageLoader label="Loading order..." compact />
      </div>
    );
  }

  if (!order) {
    return (
      <div>
        <Topbar title="Order" eyebrow="Operations" />
        <p className="text-sm text-slate-500">Order not found.</p>
        <Link href="/orders" className="mt-4 inline-block">
          <Button variant="secondary" icon={<ArrowLeft className="h-4 w-4" />}>
            Back to orders
          </Button>
        </Link>
      </div>
    );
  }

  const teller =
    employees.find((employee) => employee.id === order.tellerId)?.fullName ||
    "Staff";

  const applyStatus = async () => {
    if (!pendingStatus) return;
    setUpdating(true);
    await wait();
    const updated = updateOrderStatus(order.id, pendingStatus);
    setUpdating(false);
    setPendingStatus(null);
    if (updated) {
      setOrder(updated);
      showToast(`Status updated to ${pendingStatus}`, "success");
    }
  };

  return (
    <div>
      <Topbar title={order.id} eyebrow="Order detail" />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 no-print">
        <Link href="/orders">
          <Button variant="ghost" icon={<ArrowLeft className="h-4 w-4" />}>
            Back
          </Button>
        </Link>
        <div className="flex flex-wrap items-end gap-3">
          <Field label="Update status" className="min-w-[180px]">
            <OrderStatusSelect
              value={order.status}
              onChange={(status) => {
                if (status === order.status) return;
                setPendingStatus(status);
              }}
            />
          </Field>
          <Button
            variant="secondary"
            icon={<Printer className="h-4 w-4" />}
            onClick={() => window.print()}
          >
            Print invoice
          </Button>
        </div>
      </div>

      <InvoicePreview order={order} tellerName={teller} />

      <ConfirmDialog
        open={Boolean(pendingStatus)}
        onClose={() => setPendingStatus(null)}
        onConfirm={applyStatus}
        title="Update order status?"
        description={
          pendingStatus
            ? `Change ${order.id} from ${order.status} to ${pendingStatus}?`
            : null
        }
        confirmLabel="Update status"
        tone={pendingStatus === "Cancelled" ? "danger" : "primary"}
        loading={updating}
      />
    </div>
  );
}
