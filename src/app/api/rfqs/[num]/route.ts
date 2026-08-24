import { NextRequest, NextResponse } from "next/server";
import { pool, query, queryOne } from "@/lib/db";
import { requireRole } from "@/lib/guard";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ num: string }> }) {
  const { num } = await params;
  const rfq = await queryOne("SELECT * FROM rfqs WHERE num = $1", [num]);
  if (!rfq) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const quotes = await query("SELECT * FROM rfq_quotes WHERE rfq_num = $1", [num]);
  return NextResponse.json({ ...rfq, quotes });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ num: string }> }) {
  const denied = await requireRole("user");
  if (denied) return denied;
  const { num } = await params;
  const b = await req.json();

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const res = await client.query(
      `UPDATE rfqs SET component=$1,qty=$2,target_price=$3,deadline=$4,status=$5,awarded_supplier=$6 WHERE num=$7 RETURNING *`,
      [b.component, b.qty ?? 1, b.target_price ?? null, b.deadline ?? null, b.status, b.awarded_supplier ?? null, num]
    );
    if (!res.rows[0]) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (Array.isArray(b.quotes)) {
      await client.query("DELETE FROM rfq_quotes WHERE rfq_num = $1", [num]);
      for (const q of b.quotes) {
        await client.query(
          `INSERT INTO rfq_quotes (rfq_num,supplier_id,price,lead_time,moq,terms,warranty) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [num, q.supplier_id ?? null, q.price ?? null, q.lead_time ?? null, q.moq ?? null, q.terms ?? null, q.warranty ?? null]
        );
      }
    }
    await client.query("COMMIT");
    return NextResponse.json(res.rows[0]);
  } catch (e) {
    await client.query("ROLLBACK");
    const message = e instanceof Error ? e.message : "Failed to update RFQ";
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ num: string }> }) {
  const denied = await requireRole("admin");
  if (denied) return denied;
  const { num } = await params;
  await query("DELETE FROM rfqs WHERE num = $1", [num]);
  return NextResponse.json({ ok: true });
}
