import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = await req.json();

  if (b.password) {
    const hash = await hashPassword(b.password);
    const rows = await query(
      `UPDATE users SET username=$1, full_name=$2, role=$3, password_hash=$4 WHERE id=$5
       RETURNING id, username, full_name, role, created_at`,
      [b.username, b.full_name, b.role, hash, id]
    );
    if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(rows[0]);
  }

  const rows = await query(
    `UPDATE users SET username=$1, full_name=$2, role=$3 WHERE id=$4
     RETURNING id, username, full_name, role, created_at`,
    [b.username, b.full_name, b.role, id]
  );
  if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(rows[0]);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await query("DELETE FROM users WHERE id = $1", [id]);
  return NextResponse.json({ ok: true });
}
