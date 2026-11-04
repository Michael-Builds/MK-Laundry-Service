"use client";

import { Topbar } from "@/components/layout/Topbar";
import { useToast } from "@/components/providers/ToastProvider";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { PageLoader } from "@/components/ui/PageLoader";
import { Select } from "@/components/ui/Select";
import { formatCurrency } from "@/data/orders";
import type { Service } from "@/data/types";
import { useBootLoading } from "@/hooks/useBootLoading";
import { ApiError, api } from "@/lib/api-client";
import { Plus, Shirt } from "lucide-react";
import { SubmitEvent, useCallback, useMemo, useState } from "react";

export default function ServicesPage() {
  const { showToast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [unitPrice, setUnitPrice] = useState("10");
  const [category, setCategory] = useState<Service["category"]>("Garment");
  const [active, setActive] = useState(true);
  const [pendingToggle, setPendingToggle] = useState<Service | null>(null);
  const [creating, setCreating] = useState(false);
  const [toggling, setToggling] = useState(false);

  const boot = useCallback(async () => {
    const data = await api<{ services: Service[] }>("/api/services");
    setServices(data.services);
  }, []);
  const ready = useBootLoading(boot);

  const onCreate = async (event: SubmitEvent) => {
    event.preventDefault();
    setCreating(true);
    try {
      const data = await api<{ service: Service }>("/api/services", {
        method: "POST",
        json: {
          name: name.trim(),
          unitPrice: Number(unitPrice) || 0,
          category,
          active,
        },
      });
      setServices((current) => [data.service, ...current]);
      setOpen(false);
      setName("");
      setUnitPrice("10");
      setCategory("Garment");
      setActive(true);
      showToast("Service added", "success");
    } catch (error) {
      showToast(
        error instanceof ApiError ? error.message : "Could not add service",
        "error",
      );
    } finally {
      setCreating(false);
    }
  };

  const confirmToggle = async () => {
    if (!pendingToggle) return;
    setToggling(true);
    try {
      const data = await api<{ service: Service }>(
        `/api/services/${pendingToggle.id}`,
        {
          method: "PATCH",
          json: { active: !pendingToggle.active },
        },
      );
      setServices((current) =>
        current.map((service) =>
          service.id === data.service.id ? data.service : service,
        ),
      );
      showToast(
        pendingToggle.active ? "Service deactivated" : "Service activated",
        "success",
      );
      setPendingToggle(null);
    } catch (error) {
      showToast(
        error instanceof ApiError ? error.message : "Could not update service",
        "error",
      );
    } finally {
      setToggling(false);
    }
  };

  const columns = useMemo<DataTableColumn<Service>[]>(
    () => [
      {
        id: "service",
        header: "Service",
        cell: (service) => (
          <div>
            <p className="font-semibold text-ink">{service.name}</p>
            {service.description ? (
              <p className="text-xs text-slate-500">{service.description}</p>
            ) : null}
          </div>
        ),
      },
      {
        id: "category",
        header: "Category",
        hideOnMobile: true,
        cell: (service) => service.category,
      },
      {
        id: "price",
        header: "Unit price",
        cell: (service) => (
          <span className="font-semibold text-ink">
            {formatCurrency(service.unitPrice)}
          </span>
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: (service) => (
          <Badge
            className={
              service.active
                ? "border border-teal/20 bg-teal-soft text-teal"
                : "border border-line bg-slate-100 text-slate-500"
            }
          >
            {service.active ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      {
        id: "action",
        header: "Action",
        headerClassName: "text-right",
        className: "text-right",
        cell: (service) => (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPendingToggle(service)}
          >
            {service.active ? "Deactivate" : "Activate"}
          </Button>
        ),
      },
    ],
    [],
  );

  if (!ready) {
    return (
      <div>
        <Topbar title="Services" eyebrow="Catalog" />
        <PageLoader label="Loading services..." compact />
      </div>
    );
  }

  return (
    <div>
      <Topbar
        title="Services"
        eyebrow="Catalog"
        actions={
          <Button
            size="sm"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => setOpen(true)}
          >
            Add service
          </Button>
        }
      />

      <DataTable
        data={services}
        columns={columns}
        getRowId={(service) => service.id}
        emptyIcon={<Shirt className="h-5 w-5" />}
        emptyTitle="No services yet"
        emptyDescription="Add laundry services to build your price list."
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add service"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={creating}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="add-service-form"
              loading={creating}
              loadingText="Saving..."
            >
              Save service
            </Button>
          </>
        }
      >
        <form id="add-service-form" className="space-y-4" onSubmit={onCreate}>
          <Field label="Name" htmlFor="service-name" required>
            <Input
              id="service-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Shirt"
              required
            />
          </Field>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Unit price" htmlFor="service-price" required>
              <Input
                id="service-price"
                type="number"
                min={0}
                step="0.01"
                value={unitPrice}
                onChange={(event) => setUnitPrice(event.target.value)}
                placeholder="e.g. 10.00"
                required
              />
            </Field>
            <Field label="Category" htmlFor="service-category">
              <Select
                id="service-category"
                value={category}
                onChange={(value) =>
                  setCategory(value as Service["category"])
                }
                options={[
                  { value: "Garment", label: "Garment" },
                  { value: "Home", label: "Home" },
                  { value: "Specialty", label: "Specialty" },
                ]}
              />
            </Field>
          </div>
          <Checkbox
            id="service-active"
            label="Active in new orders"
            checked={active}
            onChange={(event) => setActive(event.target.checked)}
          />
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(pendingToggle)}
        onClose={() => setPendingToggle(null)}
        onConfirm={confirmToggle}
        title={
          pendingToggle?.active ? "Deactivate service?" : "Activate service?"
        }
        description={
          pendingToggle
            ? pendingToggle.active
              ? `${pendingToggle.name} will no longer appear when creating orders.`
              : `${pendingToggle.name} will be available in new orders again.`
            : null
        }
        confirmLabel={pendingToggle?.active ? "Deactivate" : "Activate"}
        tone={pendingToggle?.active ? "danger" : "primary"}
        loading={toggling}
      />
    </div>
  );
}
