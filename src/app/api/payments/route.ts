import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireRole } from "@/lib/guard";

export async function GET() {
  const rows = await query(`SELECT * FROM payments ORDER BY deposit_date DESC NULLS LAST`);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const denied = await requireRole("user");
  if (denied) return denied;
  const b = await req.json();
  const rows = await query(
    `INSERT INTO payments (order_num,invoice_total,deposit_pct,deposit_amount,deposit_date,balance_due,balance_date,status,notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [b.order_num ?? null, b.invoice_total ?? null, b.deposit_pct ?? null, b.deposit_amount ?? null, b.deposit_date ?? null, b.balance_due ?? null, b.balance_date ?? null, b.status ?? "Balance Pending", b.notes ?? null]
  );
  return NextResponse.json(rows[0], { status: 201 });
}
