"use client";

import type { OrderItem, Service } from "@/data/types";
import { formatCurrency } from "@/data/orders";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Plus, Trash2 } from "lucide-react";

export function ServicePicker({
  services,
  items,
  onChange,
}: {
  services: Service[];
  items: OrderItem[];
  onChange: (items: OrderItem[]) => void;
}) {
  const updateItem = (index: number, patch: Partial<OrderItem>) => {
    onChange(
      items.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  };

  const addItem = () => {
    const first = services[0];
    if (!first) return;
    onChange([
      ...items,
      {
        serviceId: first.id,
        name: first.name,
        quantity: 1,
        unitPrice: first.unitPrice,
      },
    ]);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="hidden grid-cols-[1.4fr_0.6fr_0.8fr_40px] gap-2 px-1 text-[11px] font-bold tracking-[0.08em] text-slate-500 uppercase sm:grid">
        <span>Service</span>
        <span>Qty</span>
        <span>Line total</span>
        <span />
      </div>

      {items.map((item, index) => (
        <div
          key={`${item.serviceId}-${index}`}
          className="grid grid-cols-1 gap-2 rounded-xl border border-line bg-white p-3 sm:grid-cols-[1.4fr_0.6fr_0.8fr_40px] sm:items-center sm:border-0 sm:bg-transparent sm:p-0"
        >
          <Select
            value={item.serviceId}
            onChange={(event) => {
              const service = services.find((s) => s.id === event.target.value);
              if (!service) return;
              updateItem(index, {
                serviceId: service.id,
                name: service.name,
                unitPrice: service.unitPrice,
              });
            }}
          >
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name} — {formatCurrency(service.unitPrice)}
              </option>
            ))}
          </Select>
          <Input
            type="number"
            min={1}
            value={item.quantity}
            onChange={(event) =>
              updateItem(index, {
                quantity: Math.max(1, Number(event.target.value) || 1),
              })
            }
          />
          <p className="px-1 text-sm font-semibold text-teal">
            {formatCurrency(item.quantity * item.unitPrice)}
          </p>
          <Button
            variant="danger"
            size="sm"
            aria-label="Remove item"
            icon={<Trash2 className="h-4 w-4" />}
            onClick={() => removeItem(index)}
            disabled={items.length === 1}
          />
        </div>
      ))}

      <Button
        variant="secondary"
        size="sm"
        icon={<Plus className="h-4 w-4" />}
        onClick={addItem}
      >
        Add item
      </Button>
    </div>
  );
}
