import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { requireRole } from "@/lib/guard";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await queryOne("SELECT * FROM components WHERE id = $1", [id]);
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireRole("user");
  if (denied) return denied;

  const { id } = await params;
  const b = await req.json();
  const rows = await query(
    `UPDATE components SET code=$1,description=$2,supplier_id=$3,price=$4,currency=$5,unit=$6,qty=$7
     WHERE id=$8 RETURNING *`,
    [b.code, b.description, b.supplier_id ?? null, b.price ?? 0, b.currency ?? "USD", b.unit ?? "Piece", b.qty ?? 0, id]
  );
  if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(rows[0]);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireRole("admin");
  if (denied) return denied;

  const { id } = await params;
  await query("DELETE FROM components WHERE id = $1", [id]);
  return NextResponse.json({ ok: true });
}
