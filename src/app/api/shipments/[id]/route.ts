import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { requireRole } from "@/lib/guard";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await queryOne("SELECT * FROM shipments WHERE id = $1", [id]);
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireRole("user");
  if (denied) return denied;
  const { id } = await params;
  const b = await req.json();
  const rows = await query(
    `UPDATE shipments SET bl=$1,acid=$2,supplier_id=$3,order_num=$4,vessel=$5,pol=$6,pod=$7,incoterms=$8,ship_date=$9,eta=$10,arrival=$11,status=$12,remarks=$13
     WHERE id=$14 RETURNING *`,
    [b.bl, b.acid ?? null, b.supplier_id ?? null, b.order_num ?? null, b.vessel ?? null, b.pol ?? null, b.pod ?? null, b.incoterms ?? null, b.ship_date ?? null, b.eta ?? null, b.arrival ?? null, b.status, b.remarks ?? null, id]
  );
  if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(rows[0]);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireRole("admin");
  if (denied) return denied;
  const { id } = await params;
  await query("DELETE FROM shipments WHERE id = $1", [id]);
  return NextResponse.json({ ok: true });
}
