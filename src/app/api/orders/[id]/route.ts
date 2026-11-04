import type {
  DiscountType,
  OrderItem,
  OrderStatus,
  PaymentMethod,
} from "@/data/types";
import { jsonError, requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { calcOrderTotals } from "@/lib/money";
import { fromPaymentMethod, serializeOrder } from "@/lib/serializers";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

async function findOrder(id: string, includeDeleted = false) {
  return db.order.findFirst({
    where: {
      OR: [{ id }, { code: id }],
      ...(includeDeleted ? {} : { deletedAt: null }),
    },
    include: { items: true, teller: { select: { fullName: true } } },
  });
}

export async function GET(_request: Request, { params }: Params) {
  const { user, error } = await requireUser();
  if (error || !user) return error!;

  const { id } = await params;
  const order = await findOrder(id);
  if (!order) return jsonError("Order not found.", 404);
  return NextResponse.json({ order: serializeOrder(order) });
}

export async function PATCH(request: Request, { params }: Params) {
  const { user, error } = await requireUser();
  if (error || !user) return error!;

  const { id } = await params;
  const body = (await request.json().catch(() => null)) as {
    status?: OrderStatus;
    cancelReason?: string;
    customerName?: string;
    phone?: string;
    deliveryDate?: string;
    payment?: PaymentMethod;
    notes?: string | null;
    items?: OrderItem[];
    discountType?: DiscountType;
    discountValue?: number;
  } | null;

  if (!body) return jsonError("Invalid request body.");

  const existing = await findOrder(id);
  if (!existing) return jsonError("Order not found.", 404);

  const isFullEdit =
    body.customerName !== undefined ||
    body.phone !== undefined ||
    body.deliveryDate !== undefined ||
    body.payment !== undefined ||
    body.items !== undefined ||
    body.discountType !== undefined ||
    body.discountValue !== undefined ||
    body.notes !== undefined;

  if (isFullEdit && user.role !== "Administrator") {
    return jsonError("Only administrators can edit orders.", 403);
  }

  if (isFullEdit) {
    const customerName = body.customerName?.trim() ?? existing.customerName;
    const phone = body.phone?.trim() ?? existing.phone;
    const deliveryDate = body.deliveryDate ?? existing.deliveryDate.toISOString().slice(0, 10);
    const payment = body.payment ?? (existing.payment === "MobileMoney" ? "Mobile Money" : "Cash");
    const items =
      body.items ??
      existing.items.map((item) => ({
        serviceId: item.serviceId ?? "",
        name: item.name,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
      }));
    const discountType = body.discountType ?? existing.discountType;
    const discountValue = Number(
      body.discountValue ?? existing.discountValue,
    );
    const notes =
      body.notes === undefined
        ? existing.notes
        : body.notes?.trim() || null;

    if (!customerName || !phone || !deliveryDate || items.length === 0) {
      return jsonError(
        "Customer, phone, delivery date, and items are required.",
      );
    }

    const totals = calcOrderTotals(items, discountType, discountValue);
    const nextStatus = body.status ?? existing.status;
    const cancelReason = body.cancelReason?.trim() ?? "";

    if (nextStatus === "Cancelled" && cancelReason.length < 3 && !existing.cancelReason) {
      return jsonError(
        "A cancellation reason is required (at least 3 characters).",
      );
    }

    const order = await db.$transaction(async (tx) => {
      await tx.orderItem.deleteMany({ where: { orderId: existing.id } });
      return tx.order.update({
        where: { id: existing.id },
        data: {
          customerName,
          phone,
          deliveryDate: new Date(deliveryDate),
          payment: fromPaymentMethod(payment),
          subtotal: totals.subtotal,
          discountType,
          discountValue,
          discountAmount: totals.discountAmount,
          total: totals.total,
          notes,
          status: nextStatus,
          cancelReason:
            nextStatus === "Cancelled"
              ? cancelReason || existing.cancelReason
              : null,
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
    });

    return NextResponse.json({ order: serializeOrder(order) });
  }

  if (!body.status) return jsonError("Status is required.");

  const cancelReason = body.cancelReason?.trim() ?? "";
  if (body.status === "Cancelled" && cancelReason.length < 3) {
    return jsonError(
      "A cancellation reason is required (at least 3 characters).",
    );
  }

  const order = await db.order.update({
    where: { id: existing.id },
    data: {
      status: body.status,
      cancelReason: body.status === "Cancelled" ? cancelReason : null,
    },
    include: { items: true, teller: { select: { fullName: true } } },
  });

  return NextResponse.json({ order: serializeOrder(order) });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { user, error } = await requireUser(["Administrator"]);
  if (error || !user) return error!;

  const { id } = await params;
  const existing = await findOrder(id);
  if (!existing) return jsonError("Order not found.", 404);

  await db.order.update({
    where: { id: existing.id },
    data: { deletedAt: new Date() },
  });
  return NextResponse.json({ ok: true });
}
