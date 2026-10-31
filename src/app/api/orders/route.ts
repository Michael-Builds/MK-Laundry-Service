import { jsonError, requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { calcOrderTotals } from "@/lib/money";
import { fromPaymentMethod, serializeOrder } from "@/lib/serializers";
import type { DiscountType, OrderItem, PaymentMethod } from "@/data/types";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { user, error } = await requireUser();
  if (error || !user) return error!;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const orders = await db.order.findMany({
    where: status
      ? { status: status as "Received" | "Washing" | "Ready" | "Completed" | "Cancelled" }
      : undefined,
    include: { items: true, teller: { select: { fullName: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ orders: orders.map(serializeOrder) });
}

export async function POST(request: Request) {
  const { user, error } = await requireUser();
  if (error || !user) return error!;

  const body = (await request.json().catch(() => null)) as {
    customerName?: string;
    phone?: string;
    deliveryDate?: string;
    payment?: PaymentMethod;
    notes?: string;
    items?: OrderItem[];
    discountType?: DiscountType;
    discountValue?: number;
  } | null;

  const customerName = body?.customerName?.trim() ?? "";
  const phone = body?.phone?.trim() ?? "";
  const deliveryDate = body?.deliveryDate ?? "";
  const payment = body?.payment ?? "Cash";
  const items = body?.items ?? [];
  const discountType = body?.discountType ?? "None";
  const discountValue = Number(body?.discountValue ?? 0);

  if (!customerName || !phone || !deliveryDate || items.length === 0) {
    return jsonError("Customer, phone, delivery date, and items are required.");
  }

  const totals = calcOrderTotals(items, discountType, discountValue);
  const count = await db.order.count();
  const code = `ORD-${1000 + count + 1}`;

  const order = await db.order.create({
    data: {
      code,
      customerName,
      phone,
      deliveryDate: new Date(deliveryDate),
      payment: fromPaymentMethod(payment),
      subtotal: totals.subtotal,
      discountType,
      discountValue,
      discountAmount: totals.discountAmount,
      total: totals.total,
      notes: body?.notes?.trim() || null,
      tellerId: user.id,
      items: {
        create: items.map((item) => ({
          serviceId: item.serviceId || null,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      },
    },
    include: { items: true, teller: { select: { fullName: true } } },
  });

  return NextResponse.json({ order: serializeOrder(order) }, { status: 201 });
}
