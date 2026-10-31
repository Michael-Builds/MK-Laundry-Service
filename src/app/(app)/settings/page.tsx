"use client";

import { Topbar } from "@/components/layout/Topbar";
import { useSession } from "@/components/providers/SessionProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import type { AppSettings } from "@/data/types";
import { getSettings, saveSettings } from "@/lib/store";
import { wait } from "@/lib/wait";
import { UserRound } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PageLoader } from "@/components/ui/PageLoader";

export default function SettingsPage() {
  const { user } = useSession();
  const { showToast } = useToast();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  if (!settings) {
    return (
      <div>
        <Topbar title="Settings" eyebrow="Preferences" />
        <PageLoader label="Loading settings..." compact />
      </div>
    );
  }

  const patch = (partial: Partial<AppSettings>) => {
    setSettings({ ...settings, ...partial });
  };

  const onSave = async () => {
    setSaving(true);
    await wait();
    saveSettings(settings);
    setSaving(false);
    showToast("Settings saved (demo session only)", "success");
  };

  return (
    <div>
      <Topbar title="Settings" eyebrow="Preferences" />

      <div className="w-full space-y-5">
        <section className="rounded-2xl border border-line bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Avatar name={user?.fullName || "Staff"} />
              <div>
                <h2 className="text-lg font-semibold text-ink">Your profile</h2>
                <p className="text-sm text-slate-500">
                  Update contact details or change your password.
                </p>
              </div>
            </div>
            <Link href="/settings/profile">
              <Button
                variant="secondary"
                icon={<UserRound className="h-4 w-4" />}
              >
                Open profile
              </Button>
            </Link>
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-ink">Business</h2>
          <div className="space-y-4">
            <Field label="Business name" htmlFor="business-name">
              <Input
                id="business-name"
                value={settings.businessName}
                onChange={(event) =>
                  patch({ businessName: event.target.value })
                }
              />
            </Field>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Currency" htmlFor="currency">
                <Input
                  id="currency"
                  value={settings.currency}
                  onChange={(event) => patch({ currency: event.target.value })}
                />
              </Field>
              <Field label="Symbol" htmlFor="symbol">
                <Input
                  id="symbol"
                  value={settings.currencySymbol}
                  onChange={(event) =>
                    patch({ currencySymbol: event.target.value })
                  }
                />
              </Field>
            </div>
          </div>
        </section>

        <section className="space-y-5 rounded-2xl border border-line bg-white p-6">
          <h2 className="text-lg font-semibold text-ink">Operations</h2>
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

        <div className="flex justify-end">
          <Button onClick={onSave} loading={saving} loadingText="Saving...">
            Save settings
          </Button>
        </div>
      </div>
    </div>
  );
}
