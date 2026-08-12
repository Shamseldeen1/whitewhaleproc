import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireRole } from "@/lib/guard";

export async function GET() {
  const rows = await query(
    `SELECT c.id, c.code, c.description, c.price, c.currency, c.unit, c.qty,
            c.supplier_id, s.name AS supplier_name
     FROM components c
     LEFT JOIN suppliers s ON s.id = c.supplier_id
     ORDER BY c.code ASC`
  );
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const denied = await requireRole("user");
  if (denied) return denied;

  const b = await req.json();
  if (!b.code || !b.description) {
    return NextResponse.json({ error: "code and description are required." }, { status: 400 });
  }

  const rows = await query(
    `INSERT INTO components (code,description,supplier_id,price,currency,unit,qty)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [b.code, b.description, b.supplier_id ?? null, b.price ?? 0, b.currency ?? "USD", b.unit ?? "Piece", b.qty ?? 0]
  );
  return NextResponse.json(rows[0], { status: 201 });
}
