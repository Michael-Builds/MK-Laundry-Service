import { jsonError, requireUser } from "@/lib/auth";
import { defaultSettings } from "@/data/settings";
import { db } from "@/lib/db";
import { serializeSettings } from "@/lib/serializers";
import type { AppSettings } from "@/data/types";
import { NextResponse } from "next/server";

export async function GET() {
  const { user, error } = await requireUser();
  if (error || !user) return error!;

  let settings = await db.appSettings.findUnique({ where: { id: "default" } });
  if (!settings) {
    settings = await db.appSettings.create({
      data: { id: "default", ...defaultSettings },
    });
  }

  return NextResponse.json({ settings: serializeSettings(settings) });
}

export async function PUT(request: Request) {
  const { user, error } = await requireUser(["Administrator"]);
  if (error || !user) return error!;

  const body = (await request.json().catch(() => null)) as AppSettings | null;
  if (!body?.businessName?.trim()) {
    return jsonError("Business name is required.");
  }

  const settings = await db.appSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      businessName: body.businessName.trim(),
      currency: body.currency?.trim() || defaultSettings.currency,
      currencySymbol:
        body.currencySymbol?.trim() || defaultSettings.currencySymbol,
      notifyReady: Boolean(body.notifyReady),
      autoPrintInvoice: Boolean(body.autoPrintInvoice),
      requirePhone: Boolean(body.requirePhone),
      lowStockAlerts: Boolean(body.lowStockAlerts),
    },
    update: {
      businessName: body.businessName.trim(),
      currency: body.currency?.trim() || defaultSettings.currency,
      currencySymbol:
        body.currencySymbol?.trim() || defaultSettings.currencySymbol,
      notifyReady: Boolean(body.notifyReady),
      autoPrintInvoice: Boolean(body.autoPrintInvoice),
      requirePhone: Boolean(body.requirePhone),
      lowStockAlerts: Boolean(body.lowStockAlerts),
    },
  });

  return NextResponse.json({ settings: serializeSettings(settings) });
}
