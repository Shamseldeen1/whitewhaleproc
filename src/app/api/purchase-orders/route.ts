import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireRole } from "@/lib/guard";

export async function GET() {
  const rows = await query(`SELECT * FROM purchase_orders ORDER BY date_created DESC NULLS LAST`);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const denied = await requireRole("user");
  if (denied) return denied;
  const b = await req.json();
  const rows = await query(
    `INSERT INTO purchase_orders (order_num,bl,po_number,division,date_created,creator_name,price,currency,notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [b.order_num ?? null, b.bl ?? null, b.po_number ?? null, b.division ?? null, b.date_created ?? null, b.creator_name ?? null, b.price ?? null, b.currency ?? "USD", b.notes ?? null]
  );
  return NextResponse.json(rows[0], { status: 201 });
}
