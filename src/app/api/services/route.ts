import { jsonError, requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { serializeService } from "@/lib/serializers";
import type { ServiceCategory } from "@/data/types";
import { NextResponse } from "next/server";

export async function GET() {
  const { user, error } = await requireUser();
  if (error || !user) return error!;

  const services = await db.service.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ services: services.map(serializeService) });
}

export async function POST(request: Request) {
  const { user, error } = await requireUser(["Administrator", "Manager"]);
  if (error || !user) return error!;

  const body = (await request.json().catch(() => null)) as {
    name?: string;
    unitPrice?: number;
    category?: ServiceCategory;
    active?: boolean;
    description?: string;
  } | null;

  const name = body?.name?.trim() ?? "";
  const unitPrice = Number(body?.unitPrice ?? 0);
  const category = body?.category ?? "Garment";

  if (!name) return jsonError("Service name is required.");
  if (unitPrice < 0) return jsonError("Unit price must be zero or more.");

  const service = await db.service.create({
    data: {
      name,
      unitPrice,
      category,
      active: body?.active ?? true,
      description: body?.description?.trim() || null,
    },
  });

  return NextResponse.json(
    { service: serializeService(service) },
    { status: 201 },
  );
}
