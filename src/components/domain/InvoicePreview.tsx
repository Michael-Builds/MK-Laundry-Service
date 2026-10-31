import { formatCurrency } from "@/data/orders";
import type { Order } from "@/data/types";
import { StatusBadge } from "@/components/ui/Badge";

export function InvoicePreview({
  order,
  tellerName,
  businessName = "MK Laundry Service",
}: {
  order: Order;
  tellerName: string;
  businessName?: string;
}) {
  const issued = new Date(order.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="invoice-sheet overflow-hidden rounded-2xl border border-line bg-white print:rounded-none print:border-0">
      <div className="relative overflow-hidden border-b border-line bg-[linear-gradient(135deg,#0f6b5c_0%,#142033_72%)] px-5 py-6 text-white sm:px-7 sm:py-7">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-16 -right-10 h-40 w-40 rounded-full bg-white/10"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 left-10 h-44 w-44 rounded-full bg-teal/30"
        />

        <div className="relative flex flex-wrap items-start justify-between gap-5">
          <div className="min-w-0">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-sm font-bold text-teal">
                MK
              </span>
              <div>
                <p className="font-display text-xl leading-tight font-semibold sm:text-2xl">
                  {businessName}
                </p>
                <p className="text-xs tracking-[0.14em] text-white/70 uppercase">
                  Staff invoice
                </p>
              </div>
            </div>
            <p className="max-w-sm text-sm text-white/75">
              Wash, press, and ready for pickup — thank you for trusting MK.
            </p>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
            <p className="text-[11px] font-bold tracking-[0.14em] text-white/65 uppercase">
              Order
            </p>
            <p className="mt-1 font-display text-2xl font-semibold tracking-tight">
              {order.code}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <StatusBadge status={order.status} />
              <span className="text-xs text-white/70">{issued}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 py-6 sm:px-7 sm:py-7">
        <div className="mb-6 grid gap-5 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-[11px] font-bold tracking-[0.14em] text-teal uppercase">
              Bill to
            </p>
            <p className="font-display text-lg font-semibold text-ink">
              {order.customerName}
            </p>
            <p className="mt-1 text-sm text-slate-500">{order.phone}</p>
          </div>
          <div className="sm:text-right">
            <p className="mb-2 text-[11px] font-bold tracking-[0.14em] text-teal uppercase">
              Details
            </p>
            <dl className="space-y-1.5 text-sm">
              <div className="flex gap-3 sm:justify-end">
                <dt className="text-slate-500">Delivery</dt>
                <dd className="font-medium text-ink">{order.deliveryDate}</dd>
              </div>
              <div className="flex gap-3 sm:justify-end">
                <dt className="text-slate-500">Payment</dt>
                <dd className="font-medium text-ink">{order.payment}</dd>
              </div>
              <div className="flex gap-3 sm:justify-end">
                <dt className="text-slate-500">Teller</dt>
                <dd className="font-medium text-ink">{tellerName}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mb-6 overflow-hidden rounded-xl border border-line">
          <div className="hidden grid-cols-[minmax(0,1.6fr)_0.45fr_0.7fr_0.75fr] gap-3 border-b border-line bg-mist px-4 py-2.5 text-[11px] font-bold tracking-[0.12em] text-slate-500 uppercase sm:grid">
            <span>Service</span>
            <span className="text-right">Qty</span>
            <span className="text-right">Unit</span>
            <span className="text-right">Line total</span>
          </div>
          {order.items.map((item, index) => (
            <div
              key={item.id ?? `${item.serviceId}-${index}`}
              className="border-t border-line px-4 py-3.5 text-sm first:border-t-0 sm:grid sm:grid-cols-[minmax(0,1.6fr)_0.45fr_0.7fr_0.75fr] sm:items-center sm:gap-3"
            >
              <div className="flex items-start justify-between gap-3 sm:contents">
                <span className="font-medium text-ink">{item.name}</span>
                <span className="text-slate-500 sm:hidden">
                  {item.quantity} × {formatCurrency(item.unitPrice)}
                </span>
              </div>
              <span className="hidden text-right text-slate-600 sm:block">
                {item.quantity}
              </span>
              <span className="hidden text-right text-slate-600 sm:block">
                {formatCurrency(item.unitPrice)}
              </span>
              <span className="mt-1 block text-right font-semibold text-ink sm:mt-0">
                {formatCurrency(item.quantity * item.unitPrice)}
              </span>
            </div>
          ))}
        </div>

        {(order.notes ||
          (order.status === "Cancelled" && order.cancelReason)) && (
          <div className="mb-6 space-y-3">
            {order.notes ? (
              <div className="rounded-xl border border-dashed border-line px-4 py-3">
                <p className="text-[11px] font-bold tracking-[0.12em] text-slate-500 uppercase">
                  Notes
                </p>
                <p className="mt-1 text-sm text-ink">{order.notes}</p>
              </div>
            ) : null}
            {order.status === "Cancelled" && order.cancelReason ? (
              <div className="rounded-xl border border-[var(--danger)]/20 bg-[#fef3f2] px-4 py-3">
                <p className="text-[11px] font-bold tracking-[0.12em] text-[var(--danger)] uppercase">
                  Cancel reason
                </p>
                <p className="mt-1 text-sm text-ink">{order.cancelReason}</p>
              </div>
            ) : null}
          </div>
        )}

        <div className="ml-auto w-full max-w-sm rounded-2xl border border-teal/20 bg-[linear-gradient(180deg,#e6f4f1_0%,#ffffff_58%)] p-4 sm:p-5">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>Subtotal</span>
            <span className="font-medium text-ink">
              {formatCurrency(order.subtotal)}
            </span>
          </div>
          {order.discountAmount > 0 ? (
            <div className="mt-2 flex items-center justify-between text-sm text-slate-600">
              <span>
                Discount
                {order.discountType === "Percent"
                  ? ` (${order.discountValue}%)`
                  : ""}
              </span>
              <span className="font-medium text-ink">
                -{formatCurrency(order.discountAmount)}
              </span>
            </div>
          ) : null}
          <div className="mt-3 flex items-end justify-between gap-3 border-t border-teal/20 pt-3">
            <div>
              <p className="text-[11px] font-bold tracking-[0.12em] text-teal uppercase">
                Amount due
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {order.items.length} item{order.items.length === 1 ? "" : "s"}
              </p>
            </div>
            <p className="font-display text-3xl font-semibold tracking-tight text-teal">
              {formatCurrency(order.total)}
            </p>
          </div>
        </div>

        <div className="mt-7 flex flex-wrap items-end justify-between gap-3 border-t border-line pt-5">
          <p className="text-sm text-slate-500">
            Questions? Ask the front desk — we’re glad to help.
          </p>
          <p className="text-xs tracking-[0.12em] text-slate-400 uppercase">
            MK Laundry Service
          </p>
        </div>
      </div>
    </div>
  );
}
