import { NextResponse } from "next/server";
import { getSessionUser, roleAtLeast, type Role } from "@/lib/auth";

/**
 * Ensures the current session meets `min` role. Viewers can always read
 * (that's enforced by simply not calling this on GET routes); this is used
 * to block create/update/delete for viewer-role sessions.
 * Returns a NextResponse to short-circuit with if the check fails, or null
 * if the caller is authorized to proceed.
 */
export async function requireRole(min: Role) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!roleAtLeast(user.role, min)) {
    return NextResponse.json({ error: "Forbidden — read-only access." }, { status: 403 });
  }
  return null;
}
