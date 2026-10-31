import { jsonError } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    username?: string;
    token?: string;
    password?: string;
  } | null;

  const username = body?.username?.trim() ?? "";
  const token = body?.token?.trim() ?? "";
  const password = body?.password ?? "";

  if (!username || !token || !password) {
    return jsonError("Username, token, and password are required.");
  }
  if (password.length < 4) {
    return jsonError("New password must be at least 4 characters.");
  }

  const record = await db.passwordResetToken.findUnique({
    where: { token },
    include: { employee: true },
  });

  if (
    !record ||
    record.expiresAt.getTime() < Date.now() ||
    record.employee.username.toLowerCase() !== username.toLowerCase() ||
    !record.employee.active
  ) {
    return jsonError("Reset link is invalid or expired.", 400);
  }

  await db.employee.update({
    where: { id: record.employeeId },
    data: { passwordHash: await bcrypt.hash(password, 10) },
  });
  await db.passwordResetToken.deleteMany({
    where: { employeeId: record.employeeId },
  });

  return NextResponse.json({ ok: true });
}
