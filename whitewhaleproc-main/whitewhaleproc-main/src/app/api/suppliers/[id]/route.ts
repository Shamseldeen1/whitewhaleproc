import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { requireRole } from "@/lib/guard";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await queryOne("SELECT * FROM suppliers WHERE id = $1", [id]);
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireRole("user");
  if (denied) return denied;

  const { id } = await params;
  const b = await req.json();
  const rows = await query(
    `UPDATE suppliers SET code=$1,name=$2,country=$3,contact=$4,email=$5,phone=$6,category=$7,rating=$8,notes=$9
     WHERE id=$10 RETURNING *`,
    [b.code, b.name, b.country ?? null, b.contact ?? null, b.email ?? null, b.phone ?? null, b.category ?? null, b.rating ?? null, b.notes ?? null, id]
  );
  if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(rows[0]);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireRole("admin");
  if (denied) return denied;

  const { id } = await params;
  await query("DELETE FROM suppliers WHERE id = $1", [id]);
  return NextResponse.json({ ok: true });
}
