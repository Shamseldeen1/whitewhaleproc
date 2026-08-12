import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireRole } from "@/lib/guard";

export async function GET() {
  const rows = await query(
    `SELECT sh.*, s.name AS supplier_name
     FROM shipments sh LEFT JOIN suppliers s ON s.id = sh.supplier_id
     ORDER BY sh.ship_date DESC NULLS LAST`
  );
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const denied = await requireRole("user");
  if (denied) return denied;
  const b = await req.json();
  if (!b.bl) return NextResponse.json({ error: "bl (B/L number) is required." }, { status: 400 });

  const rows = await query(
    `INSERT INTO shipments (bl,acid,supplier_id,order_num,vessel,pol,pod,incoterms,ship_date,eta,arrival,status,remarks)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
    [b.bl, b.acid ?? null, b.supplier_id ?? null, b.order_num ?? null, b.vessel ?? null, b.pol ?? null, b.pod ?? null, b.incoterms ?? null, b.ship_date ?? null, b.eta ?? null, b.arrival ?? null, b.status ?? "In Transit", b.remarks ?? null]
  );
  return NextResponse.json(rows[0], { status: 201 });
}
