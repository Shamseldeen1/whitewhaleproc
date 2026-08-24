import { NextRequest, NextResponse } from "next/server";
import { pool, query } from "@/lib/db";
import { requireRole } from "@/lib/guard";

export async function GET() {
  const orders = await query<{ id: string }>(
    `SELECT o.*, s.name AS supplier_name
     FROM orders o LEFT JOIN suppliers s ON s.id = o.supplier_id
     ORDER BY o.order_date DESC`
  );
  const items = await query<{ order_id: string }>(`SELECT * FROM order_items`);
  const withItems = orders.map((o) => ({
    ...o,
    items: items.filter((it) => it.order_id === o.id),
  }));
  return NextResponse.json(withItems);
}

export async function POST(req: NextRequest) {
  const denied = await requireRole("user");
  if (denied) return denied;

  const b = await req.json();
  if (!b.num || !Array.isArray(b.items) || b.items.length === 0) {
    return NextResponse.json({ error: "num and at least one item are required." }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const orderRes = await client.query(
      `INSERT INTO orders (num,pi_number,order_date,supplier_id,model_code,currency,status,incoterm,lead_time,notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [
        b.num,
        b.pi_number ?? null,
        b.order_date ?? new Date().toISOString().slice(0, 10),
        b.supplier_id ?? null,
        b.model_code ?? null,
        b.currency ?? "USD",
        b.status ?? "Pending",
        b.incoterm ?? null,
        b.lead_time ?? null,
        b.notes ?? null,
      ]
    );
    const order = orderRes.rows[0];

    for (const it of b.items) {
      await client.query(
        `INSERT INTO order_items (order_id, desc_text, qty, unit, price) VALUES ($1,$2,$3,$4,$5)`,
        [order.id, it.desc, it.qty ?? 1, it.unit ?? "Piece", it.price ?? 0]
      );
    }

    await client.query("COMMIT");
    return NextResponse.json(order, { status: 201 });
  } catch (e) {
    await client.query("ROLLBACK");
    const message = e instanceof Error ? e.message : "Failed to create order";
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    client.release();
  }
}
