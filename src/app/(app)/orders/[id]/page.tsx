"use client";

import { InvoicePreview } from "@/components/domain/InvoicePreview";
import { OrderStatusSelect } from "@/components/domain/OrderStatusSelect";
import { Topbar } from "@/components/layout/Topbar";
import { useToast } from "@/components/providers/ToastProvider";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Field } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { PageLoader } from "@/components/ui/PageLoader";
import { Textarea } from "@/components/ui/Textarea";
import type { Order, OrderStatus } from "@/data/types";
import { ApiError, api } from "@/lib/api-client";
import { ArrowLeft, FileText, Printer } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const { showToast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);
  const [cancelReason, setCancelReason] = useState("");
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

  const isCompleted = order.status === "Completed";
  const cancelOpen = pendingStatus === "Cancelled";
  const statusConfirmOpen = Boolean(pendingStatus) && pendingStatus !== "Cancelled";

  const closeStatusFlow = () => {
    if (updating) return;
    setPendingStatus(null);
    setCancelReason("");
  };

  const applyStatus = async (status: OrderStatus, reason?: string) => {
    setUpdating(true);
    try {
      const data = await api<{ order: Order }>(`/api/orders/${order.id}`, {
        method: "PATCH",
        json: {
          status,
          ...(status === "Cancelled" ? { cancelReason: reason } : {}),
        },
      });
      setOrder(data.order);
      showToast(
        status === "Cancelled"
          ? "Order cancelled"
          : `Status updated to ${status}`,
        "success",
      );
      setPendingStatus(null);
      setCancelReason("");
      if (status === "Completed") {
        window.setTimeout(() => window.print(), 250);
      }
    } catch (error) {
      showToast(
        error instanceof ApiError ? error.message : "Could not update status",
        "error",
      );
    } finally {
      setUpdating(false);
    }
  };

  const confirmCancel = async () => {
    if (cancelReason.trim().length < 3) {
      showToast("Enter a cancellation reason (at least 3 characters).", "error");
      return;
    }
    await applyStatus("Cancelled", cancelReason.trim());
  };

  const printInvoice = () => window.print();

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
                  setCancelReason("");
                  setPendingStatus(status);
                }}
              />
            </Field>

            {isCompleted ? (
              <Button
                fullWidth
                icon={<FileText className="h-4 w-4" />}
                onClick={printInvoice}
              >
                Generate & print invoice
              </Button>
            ) : (
              <Button
                variant="secondary"
                fullWidth
                icon={<Printer className="h-4 w-4" />}
                onClick={printInvoice}
              >
                Print invoice
              </Button>
            )}

            {order.status === "Cancelled" && order.cancelReason ? (
              <div className="rounded-xl border border-line bg-mist px-3 py-3 text-sm text-slate-600">
                <p className="font-semibold text-ink">Cancel reason</p>
                <p className="mt-1">{order.cancelReason}</p>
              </div>
            ) : null}
          </div>
        </aside>
      </div>

      <ConfirmDialog
        open={statusConfirmOpen}
        onClose={closeStatusFlow}
        onConfirm={() => {
          if (!pendingStatus) return;
          void applyStatus(pendingStatus);
        }}
        title="Update order status?"
        description={
          pendingStatus
            ? `Change this order from ${order.status} to ${pendingStatus}.`
            : undefined
        }
        confirmLabel={
          pendingStatus === "Completed" ? "Mark completed & print" : "Update status"
        }
        tone="primary"
        loading={updating}
      />

      <Modal
        open={cancelOpen}
        onClose={closeStatusFlow}
        title="Cancel order?"
        className="max-w-md"
        footer={
          <>
            <Button variant="ghost" onClick={closeStatusFlow} disabled={updating}>
              Keep order
            </Button>
            <Button
              variant="danger"
              onClick={() => void confirmCancel()}
              loading={updating}
              loadingText="Cancelling..."
            >
              Cancel order
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm leading-relaxed text-slate-600">
            Staff must enter a reason before cancelling. This is saved on the order.
          </p>
          <Field label="Cancellation reason" htmlFor="cancel-reason" required>
            <Textarea
              id="cancel-reason"
              value={cancelReason}
              onChange={(event) => setCancelReason(event.target.value)}
              placeholder="e.g. Customer requested cancellation, duplicate ticket..."
              required
            />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
