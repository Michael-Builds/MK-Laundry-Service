import { getCurrentUser, jsonError } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return jsonError("Unauthorized", 401);
  return NextResponse.json({ user });
}
