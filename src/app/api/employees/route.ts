import { jsonError, requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { serializeEmployee } from "@/lib/serializers";
import type { Role } from "@/data/types";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function GET() {
  const { user, error } = await requireUser(["Administrator"]);
  if (error || !user) return error!;

  const employees = await db.employee.findMany({
    orderBy: { fullName: "asc" },
  });
  return NextResponse.json({
    employees: employees.map(serializeEmployee),
  });
}

export async function POST(request: Request) {
  const { user, error } = await requireUser(["Administrator"]);
  if (error || !user) return error!;

  const body = (await request.json().catch(() => null)) as {
    fullName?: string;
    username?: string;
    password?: string;
    role?: Role;
    phone?: string;
    email?: string;
  } | null;

  const fullName = body?.fullName?.trim() ?? "";
  const username = body?.username?.trim() ?? "";
  const password = body?.password ?? "";
  const role = body?.role ?? "Employee";
  const phone = body?.phone?.trim() ?? "";
  const email = body?.email?.trim() ?? "";

  if (!fullName || !username || !password) {
    return jsonError("Full name, username, and password are required.");
  }
  if (password.length < 4) {
    return jsonError("Password must be at least 4 characters.");
  }

  const existing = await db.employee.findFirst({
    where: { username: { equals: username, mode: "insensitive" } },
  });
  if (existing) return jsonError("Username already exists.");

  const employee = await db.employee.create({
    data: {
      fullName,
      username,
      passwordHash: await bcrypt.hash(password, 10),
      role,
      phone,
      email,
      active: true,
    },
  });

  return NextResponse.json(
    { employee: serializeEmployee(employee) },
    { status: 201 },
  );
}
