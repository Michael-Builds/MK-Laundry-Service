"use client";

import { InvoicePreview } from "@/components/domain/InvoicePreview";
import { OrderStatusSelect } from "@/components/domain/OrderStatusSelect";
import { ServicePicker } from "@/components/domain/ServicePicker";
import { Topbar } from "@/components/layout/Topbar";
import { useSession } from "@/components/providers/SessionProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DateInput } from "@/components/ui/DateInput";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { PageLoader } from "@/components/ui/PageLoader";
import { SegmentedControl, Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { formatCurrency } from "@/data/orders";
import type {
  DiscountType,
  Order,
  OrderItem,
  OrderStatus,
  PaymentMethod,
  Service,
} from "@/data/types";
import { ApiError, api } from "@/lib/api-client";
import { calcOrderTotals } from "@/lib/money";
import { ArrowLeft, FileText, Pencil, Printer, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { SubmitEvent, useEffect, useMemo, useState } from "react";

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useSession();
  const { showToast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [payment, setPayment] = useState<PaymentMethod>("Cash");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<OrderItem[]>([]);
  const [discountType, setDiscountType] = useState<DiscountType>("None");
  const [discountValue, setDiscountValue] = useState("0");

  const isAdmin = user?.role === "Administrator";

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

  const totals = useMemo(
    () => calcOrderTotals(items, discountType, Number(discountValue) || 0),
    [items, discountType, discountValue],
  );

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
  const statusConfirmOpen =
    Boolean(pendingStatus) && pendingStatus !== "Cancelled";

  const closeStatusFlow = () => {
    if (updating) return;
    setPendingStatus(null);
    setCancelReason("");
  };

  const openEdit = async () => {
    if (!order) return;
    setCustomerName(order.customerName);
    setPhone(order.phone);
    setDeliveryDate(order.deliveryDate);
    setPayment(order.payment);
    setNotes(order.notes ?? "");
    setItems(order.items.map((item) => ({ ...item })));
    setDiscountType(order.discountType);
    setDiscountValue(String(order.discountValue));
    setEditOpen(true);

    try {
      const data = await api<{ services: Service[] }>("/api/services");
      const active = data.services.filter((service) => service.active);
      const missing = order.items
        .map((item) => item.serviceId)
        .filter(Boolean)
        .filter((id) => !active.some((service) => service.id === id))
        .map((id) => {
          const line = order.items.find((item) => item.serviceId === id)!;
          return {
            id,
            name: line.name,
            unitPrice: line.unitPrice,
            category: "Garment" as const,
            active: false,
          };
        });
      setServices([...active, ...missing]);
    } catch (error) {
      showToast(
        error instanceof ApiError ? error.message : "Could not load services",
        "error",
      );
    }
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

  const saveEdit = async (event: SubmitEvent) => {
    event.preventDefault();
    if (!customerName.trim() || !phone.trim() || items.length === 0) {
      showToast("Fill in customer, phone, and at least one item.", "error");
      return;
    }

    setSavingEdit(true);
    try {
      const data = await api<{ order: Order }>(`/api/orders/${order.id}`, {
        method: "PATCH",
        json: {
          customerName: customerName.trim(),
          phone: phone.trim(),
          deliveryDate,
          payment,
          notes: notes.trim() || null,
          items,
          discountType,
          discountValue: Number(discountValue) || 0,
        },
      });
      setOrder(data.order);
      setEditOpen(false);
      showToast("Order updated", "success");
    } catch (error) {
      showToast(
        error instanceof ApiError ? error.message : "Could not update order",
        "error",
      );
    } finally {
      setSavingEdit(false);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await api(`/api/orders/${order.id}`, { method: "DELETE" });
      showToast("Order deleted", "success");
      router.replace("/orders");
    } catch (error) {
      showToast(
        error instanceof ApiError ? error.message : "Could not delete order",
        "error",
      );
      setDeleting(false);
      setDeleteOpen(false);
    }
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

            {isAdmin ? (
              <div className="space-y-2 border-t border-line pt-4">
                <p className="text-[11px] font-bold tracking-[0.08em] text-slate-500 uppercase">
                  Admin
                </p>
                <Button
                  variant="secondary"
                  fullWidth
                  icon={<Pencil className="h-4 w-4" />}
                  onClick={() => void openEdit()}
                >
                  Edit order
                </Button>
                <Button
                  variant="danger"
                  fullWidth
                  icon={<Trash2 className="h-4 w-4" />}
                  onClick={() => setDeleteOpen(true)}
                >
                  Delete order
                </Button>
              </div>
            ) : null}

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

      <Modal
        open={editOpen}
        onClose={() => {
          if (!savingEdit) setEditOpen(false);
        }}
        title={`Edit ${order.code}`}
        className="max-w-3xl"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setEditOpen(false)}
              disabled={savingEdit}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="edit-order-form"
              loading={savingEdit}
              loadingText="Saving..."
            >
              Save changes
            </Button>
          </>
        }
      >
        <form id="edit-order-form" className="space-y-4" onSubmit={saveEdit}>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Customer name" htmlFor="edit-name" required>
              <Input
                id="edit-name"
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                placeholder="Full name"
                required
              />
            </Field>
            <Field label="Phone" htmlFor="edit-phone" required>
              <Input
                id="edit-phone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="0XX XXX XXXX"
                required
              />
            </Field>
            <Field label="Delivery date" htmlFor="edit-delivery" required>
              <DateInput
                id="edit-delivery"
                value={deliveryDate}
                onChange={(event) => setDeliveryDate(event.target.value)}
                required
              />
            </Field>
            <Field label="Payment method">
              <SegmentedControl
                value={payment}
                onChange={(value) => setPayment(value as PaymentMethod)}
                options={[
                  { value: "Cash", label: "Cash" },
                  { value: "Mobile Money", label: "Mobile Money" },
                ]}
              />
            </Field>
          </div>

          <Field label="Notes" htmlFor="edit-notes">
            <Textarea
              id="edit-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="No starch, delicate wash..."
            />
          </Field>

          <ServicePicker services={services} items={items} onChange={setItems} />

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Discount type">
              <Select
                value={discountType}
                onChange={(value) => {
                  const next = value as DiscountType;
                  setDiscountType(next);
                  if (next === "None") setDiscountValue("0");
                }}
                options={[
                  { value: "None", label: "No discount" },
                  { value: "Percent", label: "Percentage (%)" },
                  { value: "Fixed", label: "Fixed amount" },
                ]}
              />
            </Field>
            <Field
              label={
                discountType === "Percent" ? "Discount %" : "Discount amount"
              }
              htmlFor="edit-discount"
            >
              <Input
                id="edit-discount"
                type="number"
                min="0"
                step="0.01"
                value={discountValue}
                disabled={discountType === "None"}
                onChange={(event) => setDiscountValue(event.target.value)}
                placeholder={discountType === "Percent" ? "e.g. 10" : "e.g. 5.00"}
              />
            </Field>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-teal/20 bg-teal-soft px-4 py-3 text-sm">
            <span className="text-slate-600">Updated total</span>
            <strong className="text-lg text-teal">
              {formatCurrency(totals.total)}
            </strong>
          </div>
        </form>
      </Modal>

      <Modal
        open={deleteOpen}
        onClose={() => {
          if (!deleting) setDeleteOpen(false);
        }}
        title="Delete order?"
        className="max-w-md"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setDeleteOpen(false)}
              disabled={deleting}
            >
              Keep order
            </Button>
            <Button
              variant="danger"
              onClick={() => void confirmDelete()}
              loading={deleting}
              loadingText="Deleting..."
              icon={<Trash2 className="h-4 w-4" />}
            >
              Yes, delete order
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm leading-relaxed text-slate-600">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-ink">{order.code}</span>? It
            will be removed from the live orders list.
          </p>
          <p className="rounded-xl border border-line bg-mist px-3 py-2.5 text-sm text-slate-600">
            This is a soft delete — the record is kept in the database and can
            be recovered later if needed.
          </p>
        </div>
      </Modal>
    </div>
  );
}
