"use client";

import { Topbar } from "@/components/layout/Topbar";
import { useToast } from "@/components/providers/ToastProvider";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { PageLoader } from "@/components/ui/PageLoader";
import { Toggle } from "@/components/ui/Toggle";
import type { AppSettings } from "@/data/types";
import { ApiError, api } from "@/lib/api-client";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const data = await api<{ settings: AppSettings }>("/api/settings");
        if (alive) setSettings(data.settings);
      } catch (error) {
        if (alive) {
          showToast(
            error instanceof ApiError
              ? error.message
              : "Could not load settings",
            "error",
          );
        }
      }
    };
    void load();
    return () => {
      alive = false;
    };
  }, [showToast]);

  if (!settings) {
    return (
      <div>
        <Topbar title="Settings" eyebrow="Business" />
        <PageLoader label="Loading settings..." compact />
      </div>
    );
  }

  const patch = (partial: Partial<AppSettings>) => {
    setSettings({ ...settings, ...partial });
  };

  const onSave = async () => {
    setSaving(true);
    try {
      const data = await api<{ settings: AppSettings }>("/api/settings", {
        method: "PUT",
        json: settings,
      });
      setSettings(data.settings);
      showToast("Settings saved", "success");
    } catch (error) {
      showToast(
        error instanceof ApiError ? error.message : "Could not save settings",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Topbar
        title="Settings"
        eyebrow="Business"
        actions={
          <Button onClick={onSave} loading={saving} loadingText="Saving..." size="sm">
            Save settings
          </Button>
        }
      />

      <div className="grid w-full gap-5 xl:grid-cols-2">
        <section className="rounded-2xl border border-line bg-white p-5 sm:p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-ink">Business</h2>
            <p className="mt-1 text-sm text-slate-500">
              Shop identity and currency shown on invoices.
            </p>
          </div>
          <div className="space-y-4">
            <Field label="Business name" htmlFor="business-name">
              <Input
                id="business-name"
                value={settings.businessName}
                onChange={(event) =>
                  patch({ businessName: event.target.value })
                }
                placeholder="MK Laundry Service"
              />
            </Field>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Currency" htmlFor="currency">
                <Input
                  id="currency"
                  value={settings.currency}
                  onChange={(event) => patch({ currency: event.target.value })}
                  placeholder="Ghana Cedi"
                />
              </Field>
              <Field label="Symbol" htmlFor="symbol">
                <Input
                  id="symbol"
                  value={settings.currencySymbol}
                  onChange={(event) =>
                    patch({ currencySymbol: event.target.value })
                  }
                  placeholder="GH₵"
                />
              </Field>
            </div>
          </div>
        </section>

        <section className="space-y-5 rounded-2xl border border-line bg-white p-5 sm:p-6">
          <div>
            <h2 className="text-lg font-semibold text-ink">Operations</h2>
            <p className="mt-1 text-sm text-slate-500">
              Desk preferences for day-to-day laundry workflow.
            </p>
          </div>
          <Toggle
            id="notify-ready"
            label="Notify when ready"
            description="Show staff alerts when an order moves to Ready."
            checked={settings.notifyReady}
            onChange={(checked) => patch({ notifyReady: checked })}
          />
          <Toggle
            id="auto-print"
            label="Auto-print invoice"
            description="Open print dialog after creating an order."
            checked={settings.autoPrintInvoice}
            onChange={(checked) => patch({ autoPrintInvoice: checked })}
          />
          <Toggle
            id="require-phone"
            label="Require phone number"
            description="Block order creation without a customer phone."
            checked={settings.requirePhone}
            onChange={(checked) => patch({ requirePhone: checked })}
          />
          <Toggle
            id="low-stock"
            label="Low stock alerts"
            description="Reserved for future inventory tracking."
            checked={settings.lowStockAlerts}
            onChange={(checked) => patch({ lowStockAlerts: checked })}
          />
        </section>
      </div>
    </div>
  );
}
