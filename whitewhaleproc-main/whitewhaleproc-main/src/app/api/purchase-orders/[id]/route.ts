import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { requireRole } from "@/lib/guard";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await queryOne("SELECT * FROM purchase_orders WHERE id = $1", [id]);
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireRole("user");
  if (denied) return denied;
  const { id } = await params;
  const b = await req.json();
  const rows = await query(
    `UPDATE purchase_orders SET order_num=$1,bl=$2,po_number=$3,division=$4,date_created=$5,creator_name=$6,price=$7,currency=$8,notes=$9
     WHERE id=$10 RETURNING *`,
    [b.order_num ?? null, b.bl ?? null, b.po_number ?? null, b.division ?? null, b.date_created ?? null, b.creator_name ?? null, b.price ?? null, b.currency ?? "USD", b.notes ?? null, id]
  );
  if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(rows[0]);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireRole("admin");
  if (denied) return denied;
  const { id } = await params;
  await query("DELETE FROM purchase_orders WHERE id = $1", [id]);
  return NextResponse.json({ ok: true });
}
