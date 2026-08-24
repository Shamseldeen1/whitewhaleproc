import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireRole } from "@/lib/guard";

export async function GET() {
  const rows = await query(`SELECT * FROM samples ORDER BY sample_date DESC NULLS LAST`);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const denied = await requireRole("user");
  if (denied) return denied;
  const b = await req.json();
  const rows = await query(
    `INSERT INTO samples (sample_date,supplier_name,item_desc,qty_received,qty_accepted,qty_rejected,notes,report_received)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [b.sample_date ?? null, b.supplier_name ?? null, b.item_desc ?? null, b.qty_received ?? 0, b.qty_accepted ?? 0, b.qty_rejected ?? 0, b.notes ?? null, b.report_received ?? "no"]
  );
  return NextResponse.json(rows[0], { status: 201 });
}
