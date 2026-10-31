import { jsonError, requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { user, error } = await requireUser();
  if (error || !user) return error!;

  const { id } = await params;
  if (user.id !== id) return jsonError("Forbidden", 403);

  const body = (await request.json().catch(() => null)) as {
    currentPassword?: string;
    nextPassword?: string;
  } | null;

  const currentPassword = body?.currentPassword ?? "";
  const nextPassword = body?.nextPassword ?? "";

  if (!currentPassword || !nextPassword) {
    return jsonError("Current and new passwords are required.");
  }
  if (nextPassword.length < 4) {
    return jsonError("New password must be at least 4 characters.");
  }

  const employee = await db.employee.findUnique({ where: { id } });
  if (!employee) return jsonError("Account not found.", 404);

  const valid = await bcrypt.compare(currentPassword, employee.passwordHash);
  if (!valid) return jsonError("Current password is incorrect.");

  await db.employee.update({
    where: { id },
    data: { passwordHash: await bcrypt.hash(nextPassword, 10) },
  });

  return NextResponse.json({ ok: true });
}
