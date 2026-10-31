"use client";

import { InvoicePreview } from "@/components/domain/InvoicePreview";
import { OrderStatusSelect } from "@/components/domain/OrderStatusSelect";
import { Topbar } from "@/components/layout/Topbar";
import { useToast } from "@/components/providers/ToastProvider";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Field } from "@/components/ui/Field";
import { PageLoader } from "@/components/ui/PageLoader";
import type { Order, OrderStatus } from "@/data/types";
import { ApiError, api } from "@/lib/api-client";
import { ArrowLeft, Printer } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

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
      try {
        const data = await api<{ order: Order }>(`/api/orders/${params.id}`);
        if (!alive) return;
        setOrder(data.order);
      } catch {
        if (!alive) return;
        setOrder(null);
      } finally {
        if (alive) setLoading(false);
      }
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

  const applyStatus = async () => {
    if (!pendingStatus) return;
    setUpdating(true);
    try {
      const data = await api<{ order: Order }>(`/api/orders/${order.id}`, {
        method: "PATCH",
        json: { status: pendingStatus },
      });
      setOrder(data.order);
      showToast(`Status updated to ${pendingStatus}`, "success");
      setPendingStatus(null);
    } catch (error) {
      showToast(
        error instanceof ApiError ? error.message : "Could not update status",
        "error",
      );
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div>
      <Topbar
        title={order.code}
        eyebrow="Order detail"
        actions={
          <Link href="/orders">
            <Button variant="ghost" size="sm" icon={<ArrowLeft className="h-4 w-4" />}>
              Back
            </Button>
          </Link>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <InvoicePreview
          order={order}
          tellerName={order.tellerName || "Staff"}
        />

        <aside className="no-print xl:sticky xl:top-6 xl:self-start">
          <div className="space-y-4 rounded-2xl border border-line bg-white p-4 sm:p-5">
            <div>
              <p className="text-[11px] font-bold tracking-[0.08em] text-slate-500 uppercase">
                Actions
              </p>
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-ink">Current status</p>
                <StatusBadge status={order.status} />
              </div>
            </div>

            <Field label="Update status">
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
              fullWidth
              icon={<Printer className="h-4 w-4" />}
              onClick={() => window.print()}
            >
              Print invoice
            </Button>
          </div>
        </aside>
      </div>

      <ConfirmDialog
        open={Boolean(pendingStatus)}
        onClose={() => setPendingStatus(null)}
        onConfirm={applyStatus}
        title="Update order status?"
        description={
          pendingStatus
            ? `Change this order from ${order.status} to ${pendingStatus}.`
            : undefined
        }
        confirmLabel="Update status"
        tone="primary"
        loading={updating}
      />
    </div>
  );
}
