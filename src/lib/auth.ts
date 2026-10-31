import { db } from "@/lib/db";
import { serializeEmployee } from "@/lib/serializers";
import type { SessionUser } from "@/data/types";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const COOKIE_NAME = "mk_session";

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not set");
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(employeeId: string) {
  return new SignJWT({ sub: employeeId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function readSessionEmployeeId() {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const employeeId = await readSessionEmployeeId();
  if (!employeeId) return null;
  const employee = await db.employee.findUnique({ where: { id: employeeId } });
  if (!employee || !employee.active) return null;
  return serializeEmployee(employee);
}

export async function requireUser(roles?: SessionUser["role"][]) {
  const user = await getCurrentUser();
  if (!user) {
    return { user: null as SessionUser | null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (roles && !roles.includes(user.role)) {
    return { user: null as SessionUser | null, error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { user, error: null as NextResponse | null };
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
