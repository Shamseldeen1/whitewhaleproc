import { NextRequest, NextResponse } from "next/server";
import { pool, query, queryOne } from "@/lib/db";
import { requireRole } from "@/lib/guard";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await queryOne("SELECT * FROM orders WHERE id = $1", [id]);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const items = await query("SELECT * FROM order_items WHERE order_id = $1", [id]);
  return NextResponse.json({ ...order, items });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireRole("user");
  if (denied) return denied;

  const { id } = await params;
  const b = await req.json();

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const res = await client.query(
      `UPDATE orders SET num=$1,pi_number=$2,order_date=$3,supplier_id=$4,model_code=$5,currency=$6,status=$7,incoterm=$8,lead_time=$9,notes=$10
       WHERE id=$11 RETURNING *`,
      [b.num, b.pi_number ?? null, b.order_date, b.supplier_id ?? null, b.model_code ?? null, b.currency ?? "USD", b.status, b.incoterm ?? null, b.lead_time ?? null, b.notes ?? null, id]
    );
    if (!res.rows[0]) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (Array.isArray(b.items)) {
      await client.query("DELETE FROM order_items WHERE order_id = $1", [id]);
      for (const it of b.items) {
        await client.query(
          `INSERT INTO order_items (order_id, desc_text, qty, unit, price) VALUES ($1,$2,$3,$4,$5)`,
          [id, it.desc, it.qty ?? 1, it.unit ?? "Piece", it.price ?? 0]
        );
      }
    }

    await client.query("COMMIT");
    return NextResponse.json(res.rows[0]);
  } catch (e) {
    await client.query("ROLLBACK");
    const message = e instanceof Error ? e.message : "Failed to update order";
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireRole("admin");
  if (denied) return denied;

  const { id } = await params;
  await query("DELETE FROM orders WHERE id = $1", [id]);
  return NextResponse.json({ ok: true });
}
