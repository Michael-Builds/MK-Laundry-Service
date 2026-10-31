import { jsonError } from "@/lib/auth";
import { db } from "@/lib/db";
import { randomBytes } from "crypto";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    username?: string;
  } | null;
  const username = body?.username?.trim() ?? "";
  if (!username) return jsonError("Username is required.");

  const employee = await db.employee.findFirst({
    where: {
      username: { equals: username, mode: "insensitive" },
      active: true,
    },
  });

  // Avoid account enumeration — always succeed if missing.
  if (!employee) {
    return NextResponse.json({ ok: true });
  }

  await db.passwordResetToken.deleteMany({ where: { employeeId: employee.id } });

  const token = randomBytes(24).toString("hex");
  await db.passwordResetToken.create({
    data: {
      token,
      employeeId: employee.id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 30),
    },
  });

  return NextResponse.json({
    ok: true,
    // Demo-friendly: return token so the UI can deep-link without email.
    token,
    username: employee.username,
  });
}
