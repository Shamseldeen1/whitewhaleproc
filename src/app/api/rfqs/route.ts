import { NextRequest, NextResponse } from "next/server";
import { pool, query } from "@/lib/db";
import { requireRole } from "@/lib/guard";

export async function GET() {
  const rfqs = await query<{ num: string }>(`SELECT * FROM rfqs ORDER BY deadline DESC NULLS LAST`);
  const quotes = await query<{ rfq_num: string }>(
    `SELECT q.*, s.name AS supplier_name FROM rfq_quotes q LEFT JOIN suppliers s ON s.id = q.supplier_id`
  );
  const withQuotes = rfqs.map((r) => ({ ...r, quotes: quotes.filter((q) => q.rfq_num === r.num) }));
  return NextResponse.json(withQuotes);
}

export async function POST(req: NextRequest) {
  const denied = await requireRole("user");
  if (denied) return denied;
  const b = await req.json();
  if (!b.num || !b.component) {
    return NextResponse.json({ error: "num and component are required." }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const res = await client.query(
      `INSERT INTO rfqs (num,component,qty,target_price,deadline,status,awarded_supplier)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [b.num, b.component, b.qty ?? 1, b.target_price ?? null, b.deadline ?? null, b.status ?? "Comparing", b.awarded_supplier ?? null]
    );
    for (const q of b.quotes ?? []) {
      await client.query(
        `INSERT INTO rfq_quotes (rfq_num,supplier_id,price,lead_time,moq,terms,warranty) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [b.num, q.supplier_id ?? null, q.price ?? null, q.lead_time ?? null, q.moq ?? null, q.terms ?? null, q.warranty ?? null]
      );
    }
    await client.query("COMMIT");
    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (e) {
    await client.query("ROLLBACK");
    const message = e instanceof Error ? e.message : "Failed to create RFQ";
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    client.release();
  }
}
