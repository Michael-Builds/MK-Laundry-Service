import { jsonError, requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { serializeOrder } from "@/lib/serializers";
import type { OrderStatus } from "@/data/types";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { user, error } = await requireUser();
  if (error || !user) return error!;

  const { id } = await params;
  const order = await db.order.findFirst({
    where: { OR: [{ id }, { code: id }] },
    include: { items: true, teller: { select: { fullName: true } } },
  });

  if (!order) return jsonError("Order not found.", 404);
  return NextResponse.json({ order: serializeOrder(order) });
}

export async function PATCH(request: Request, { params }: Params) {
  const { user, error } = await requireUser();
  if (error || !user) return error!;

  const { id } = await params;
  const body = (await request.json().catch(() => null)) as {
    status?: OrderStatus;
  } | null;

  if (!body?.status) return jsonError("Status is required.");

  const existing = await db.order.findFirst({
    where: { OR: [{ id }, { code: id }] },
  });
  if (!existing) return jsonError("Order not found.", 404);

  const order = await db.order.update({
    where: { id: existing.id },
    data: { status: body.status },
    include: { items: true, teller: { select: { fullName: true } } },
  });

  return NextResponse.json({ order: serializeOrder(order) });
}
