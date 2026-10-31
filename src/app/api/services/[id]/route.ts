import { jsonError, requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { serializeService } from "@/lib/serializers";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { user, error } = await requireUser(["Administrator", "Manager"]);
  if (error || !user) return error!;

  const { id } = await params;
  const body = (await request.json().catch(() => null)) as {
    active?: boolean;
    name?: string;
    unitPrice?: number;
    description?: string | null;
  } | null;

  const existing = await db.service.findUnique({ where: { id } });
  if (!existing) return jsonError("Service not found.", 404);

  const service = await db.service.update({
    where: { id },
    data: {
      ...(typeof body?.active === "boolean" ? { active: body.active } : {}),
      ...(body?.name !== undefined ? { name: body.name.trim() } : {}),
      ...(body?.unitPrice !== undefined ? { unitPrice: body.unitPrice } : {}),
      ...(body?.description !== undefined
        ? { description: body.description?.trim() || null }
        : {}),
    },
  });

  return NextResponse.json({ service: serializeService(service) });
}
