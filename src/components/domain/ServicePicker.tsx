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

  const options = services.map((service) => ({
    value: service.id,
    label: service.name,
    description: formatCurrency(service.unitPrice),
  }));

  return (
    <div className="space-y-3">
      <div className="hidden grid-cols-[minmax(0,1.6fr)_110px_120px_44px] gap-3 px-1 text-[11px] font-bold tracking-[0.08em] text-slate-500 uppercase lg:grid">
        <span>Service</span>
        <span>Qty</span>
        <span>Line total</span>
        <span />
      </div>

      {items.map((item, index) => (
        <div
          key={`${item.serviceId}-${index}`}
          className="grid grid-cols-1 gap-3 rounded-xl border border-line bg-mist/40 p-3 lg:grid-cols-[minmax(0,1.6fr)_110px_120px_44px] lg:items-center lg:bg-transparent lg:p-0 lg:border-0"
        >
          <div>
            <p className="mb-1.5 text-xs font-semibold text-slate-500 lg:hidden">
              Service
            </p>
            <Select
              value={item.serviceId}
              options={options}
              onChange={(nextId) => {
                const service = services.find((s) => s.id === nextId);
                if (!service) return;
                updateItem(index, {
                  serviceId: service.id,
                  name: service.name,
                  unitPrice: service.unitPrice,
                });
              }}
              aria-label={`Service for item ${index + 1}`}
            />
          </div>
          <div>
            <p className="mb-1.5 text-xs font-semibold text-slate-500 lg:hidden">
              Qty
            </p>
            <Input
              type="number"
              min={1}
              value={item.quantity}
              onChange={(event) =>
                updateItem(index, {
                  quantity: Math.max(1, Number(event.target.value) || 1),
                })
              }
              aria-label={`Quantity for item ${index + 1}`}
            />
          </div>
          <div className="flex items-center justify-between gap-3 lg:block">
            <p className="text-xs font-semibold text-slate-500 lg:hidden">
              Line total
            </p>
            <p className="text-sm font-semibold text-teal lg:px-1">
              {formatCurrency(item.quantity * item.unitPrice)}
            </p>
          </div>
          <Button
            variant="danger"
            size="sm"
            aria-label="Remove item"
            icon={<Trash2 className="h-4 w-4" />}
            onClick={() => removeItem(index)}
            disabled={items.length === 1}
            className="w-full lg:w-auto"
          />
        </div>
      ))}

      <Button
        variant="secondary"
        size="sm"
        icon={<Plus className="h-4 w-4" />}
        onClick={addItem}
        disabled={services.length === 0}
      >
        Add item
      </Button>
    </div>
  );
}
