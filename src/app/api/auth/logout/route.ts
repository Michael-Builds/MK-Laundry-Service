import { clearSessionCookie } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST() {
  return clearSessionCookie(NextResponse.json({ ok: true }));
}
