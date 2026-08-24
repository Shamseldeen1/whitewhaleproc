import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function GET() {
  const rows = await query(`SELECT id, username, full_name, role, created_at FROM users ORDER BY full_name ASC`);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  // Middleware already restricts /api/users to admins.
  const b = await req.json();
  if (!b.username || !b.password || !b.full_name || !b.role) {
    return NextResponse.json({ error: "username, password, full_name and role are required." }, { status: 400 });
  }
  const hash = await hashPassword(b.password);
  const rows = await query(
    `INSERT INTO users (username,password_hash,full_name,role) VALUES ($1,$2,$3,$4)
     RETURNING id, username, full_name, role, created_at`,
    [b.username, hash, b.full_name, b.role]
  );
  return NextResponse.json(rows[0], { status: 201 });
}
