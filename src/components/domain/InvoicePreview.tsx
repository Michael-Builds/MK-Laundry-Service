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
  return (
    <div className="rounded-2xl border border-line bg-white p-6 print:border-0">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-line pb-5">
        <div>
          <p className="font-display text-2xl font-semibold text-ink">
            {businessName}
          </p>
          <p className="mt-1 text-sm text-slate-500">Invoice / Order ticket</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-ink">{order.id}</p>
          <div className="mt-2 flex justify-end">
            <StatusBadge status={order.status} />
          </div>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-line bg-mist p-4">
          <p className="mb-2 text-[11px] font-bold tracking-[0.08em] text-slate-500 uppercase">
            Customer
          </p>
          <p className="font-semibold text-ink">{order.customerName}</p>
          <p className="text-sm text-slate-500">{order.phone}</p>
        </div>
        <div className="rounded-xl border border-line bg-mist p-4">
          <p className="mb-2 text-[11px] font-bold tracking-[0.08em] text-slate-500 uppercase">
            Order details
          </p>
          <p className="text-sm text-ink">
            <span className="text-slate-500">Delivery:</span> {order.deliveryDate}
          </p>
          <p className="text-sm text-ink">
            <span className="text-slate-500">Payment:</span> {order.payment}
          </p>
          <p className="text-sm text-ink">
            <span className="text-slate-500">Teller:</span> {tellerName}
          </p>
        </div>
      </div>

      <div className="mb-5 overflow-hidden rounded-xl border border-line">
        <div className="grid grid-cols-[1.4fr_0.5fr_0.6fr_0.7fr] gap-2 border-b border-line bg-mist px-4 py-2 text-[11px] font-bold tracking-[0.08em] text-slate-500 uppercase">
          <span>Item</span>
          <span>Qty</span>
          <span>Price</span>
          <span>Total</span>
        </div>
        {order.items.map((item, index) => (
          <div
            key={`${item.serviceId}-${index}`}
            className="grid grid-cols-[1.4fr_0.5fr_0.6fr_0.7fr] gap-2 border-t border-line px-4 py-3 text-sm first:border-t-0"
          >
            <span className="font-medium text-ink">{item.name}</span>
            <span>{item.quantity}</span>
            <span>{formatCurrency(item.unitPrice)}</span>
            <span className="font-semibold text-ink">
              {formatCurrency(item.quantity * item.unitPrice)}
            </span>
          </div>
        ))}
      </div>

      {order.notes ? (
        <p className="mb-4 text-sm text-slate-500">
          <span className="font-semibold text-ink">Notes:</span> {order.notes}
        </p>
      ) : null}

      <div className="flex items-center justify-between rounded-xl border border-teal/20 bg-teal-soft px-4 py-4">
        <span className="font-semibold text-ink">Total due</span>
        <span className="text-2xl font-semibold text-teal">
          {formatCurrency(order.total)}
        </span>
      </div>
    </div>
  );
}
