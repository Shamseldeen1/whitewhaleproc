import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { requireRole } from "@/lib/guard";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await queryOne("SELECT * FROM samples WHERE id = $1", [id]);
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireRole("user");
  if (denied) return denied;
  const { id } = await params;
  const b = await req.json();
  const rows = await query(
    `UPDATE samples SET sample_date=$1,supplier_name=$2,item_desc=$3,qty_received=$4,qty_accepted=$5,qty_rejected=$6,notes=$7,report_received=$8
     WHERE id=$9 RETURNING *`,
    [b.sample_date ?? null, b.supplier_name ?? null, b.item_desc ?? null, b.qty_received ?? 0, b.qty_accepted ?? 0, b.qty_rejected ?? 0, b.notes ?? null, b.report_received ?? "no", id]
  );
  if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(rows[0]);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireRole("admin");
  if (denied) return denied;
  const { id } = await params;
  await query("DELETE FROM samples WHERE id = $1", [id]);
  return NextResponse.json({ ok: true });
}
