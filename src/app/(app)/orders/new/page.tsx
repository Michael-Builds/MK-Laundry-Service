"use client";

import { ServicePicker } from "@/components/domain/ServicePicker";
import { Topbar } from "@/components/layout/Topbar";
import { useSession } from "@/components/providers/SessionProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { Button } from "@/components/ui/Button";
import { DateInput } from "@/components/ui/DateInput";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { RadioGroup } from "@/components/ui/RadioGroup";
import { Textarea } from "@/components/ui/Textarea";
import { formatCurrency } from "@/data/orders";
import type { OrderItem, PaymentMethod, Service } from "@/data/types";
import { addOrder, getServices } from "@/lib/store";
import { wait } from "@/lib/wait";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

export default function NewOrderPage() {
  const { user } = useSession();
  const { showToast } = useToast();
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [payment, setPayment] = useState<PaymentMethod>("Cash");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<OrderItem[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const active = getServices().filter((service) => service.active);
    setServices(active);
    if (active[0]) {
      setItems([
        {
          serviceId: active[0].id,
          name: active[0].name,
          quantity: 1,
          unitPrice: active[0].unitPrice,
        },
      ]);
    }
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDeliveryDate(tomorrow.toISOString().slice(0, 10));
  }, []);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
    [items],
  );

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user || submitting) return;
    if (!customerName.trim() || !phone.trim() || items.length === 0) {
      showToast("Fill in customer, phone, and at least one item.", "error");
      return;
    }

    setSubmitting(true);
    await wait(500);
    const id = `ORD-${1043 + Math.floor(Math.random() * 80)}`;
    addOrder({
      id,
      customerName: customerName.trim(),
      phone: phone.trim(),
      deliveryDate,
      payment,
      items,
      total,
      status: "Received",
      tellerId: user.id,
      createdAt: new Date().toISOString(),
      notes: notes.trim() || undefined,
    });

    showToast(`Order ${id} created`, "success");
    router.push(`/orders/${id}`);
  };

  return (
    <div>
      <Topbar title="New order" eyebrow="Operations" />

      <form
        onSubmit={onSubmit}
        className="max-w-3xl space-y-5 rounded-2xl border border-line bg-white p-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Customer name" htmlFor="name" required>
            <Input
              id="name"
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              placeholder="Full name"
              required
            />
          </Field>
          <Field label="Phone" htmlFor="phone" required>
            <Input
              id="phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="0XX XXX XXXX"
              required
            />
          </Field>
          <Field label="Delivery date" htmlFor="delivery" required>
            <DateInput
              id="delivery"
              value={deliveryDate}
              onChange={(event) => setDeliveryDate(event.target.value)}
              required
            />
          </Field>
          <Field label="Payment method">
            <RadioGroup
              name="payment"
              value={payment}
              onChange={(value) => setPayment(value as PaymentMethod)}
              options={[
                { value: "Cash", label: "Cash" },
                { value: "Mobile Money", label: "Mobile Money" },
              ]}
            />
          </Field>
        </div>

        <Field label="Items" required>
          <ServicePicker services={services} items={items} onChange={setItems} />
        </Field>

        <Field label="Notes" htmlFor="notes" hint="Optional special instructions">
          <Textarea
            id="notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="No starch, delicate wash..."
          />
        </Field>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-teal/20 bg-teal-soft px-4 py-4">
          <span className="font-semibold text-ink">Amount due</span>
          <strong className="text-2xl text-teal">{formatCurrency(total)}</strong>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/orders")}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={submitting}
            loadingText="Creating..."
          >
            Create order
          </Button>
        </div>
      </form>
    </div>
  );
}
