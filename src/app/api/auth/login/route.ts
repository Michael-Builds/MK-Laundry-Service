import { createSessionToken, jsonError, setSessionCookie } from "@/lib/auth";
import { db } from "@/lib/db";
import { serializeEmployee } from "@/lib/serializers";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    username?: string;
    password?: string;
  } | null;

  const username = body?.username?.trim() ?? "";
  const password = body?.password ?? "";
  if (!username || !password) {
    return jsonError("Username and password are required.");
  }

  const employee = await db.employee.findFirst({
    where: { username: { equals: username, mode: "insensitive" } },
  });

  if (!employee || !employee.active) {
    return jsonError("Invalid username or password.", 401);
  }

  const valid = await bcrypt.compare(password, employee.passwordHash);
  if (!valid) {
    return jsonError("Invalid username or password.", 401);
  }

  const token = await createSessionToken(employee.id);
  const response = NextResponse.json({ user: serializeEmployee(employee) });
  return setSessionCookie(response, token);
}
