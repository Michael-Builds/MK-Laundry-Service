import { jsonError, requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { serializeEmployee } from "@/lib/serializers";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { user, error } = await requireUser();
  if (error || !user) return error!;

  const { id } = await params;
  const body = (await request.json().catch(() => null)) as {
    active?: boolean;
    fullName?: string;
    phone?: string;
    email?: string;
  } | null;

  const existing = await db.employee.findUnique({ where: { id } });
  if (!existing) return jsonError("Employee not found.", 404);

  const isSelf = user.id === id;
  const isAdmin = user.role === "Administrator";

  if (!isSelf && !isAdmin) {
    return jsonError("Forbidden", 403);
  }

  if (typeof body?.active === "boolean" && !isAdmin) {
    return jsonError("Only administrators can change active status.", 403);
  }

  const employee = await db.employee.update({
    where: { id },
    data: {
      ...(typeof body?.active === "boolean" ? { active: body.active } : {}),
      ...(body?.fullName !== undefined ? { fullName: body.fullName.trim() } : {}),
      ...(body?.phone !== undefined ? { phone: body.phone.trim() } : {}),
      ...(body?.email !== undefined ? { email: body.email.trim() } : {}),
    },
  });

  return NextResponse.json({ employee: serializeEmployee(employee) });
}
