import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireRole } from "@/lib/guard";

export async function GET() {
  const rows = await query(
    `SELECT id, code, name, country, contact, email, phone, category, rating, notes, created_at
     FROM suppliers ORDER BY name ASC`
  );
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const denied = await requireRole("user");
  if (denied) return denied;

  const b = await req.json();
  if (!b.code || !b.name) {
    return NextResponse.json({ error: "code and name are required." }, { status: 400 });
  }

  const rows = await query(
    `INSERT INTO suppliers (code,name,country,contact,email,phone,category,rating,notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [b.code, b.name, b.country ?? null, b.contact ?? null, b.email ?? null, b.phone ?? null, b.category ?? null, b.rating ?? null, b.notes ?? null]
  );
  return NextResponse.json(rows[0], { status: 201 });
}
