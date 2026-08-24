import { NextResponse } from "next/server";
import { queryOne } from "@/lib/db";

export async function GET() {
  const [orders, suppliers, components, shipments, rfqs, spend, outOfStock, pendingOrders, activeShipments] = await Promise.all([
    queryOne<{ count: string }>("SELECT count(*) FROM orders"),
    queryOne<{ count: string }>("SELECT count(*) FROM suppliers"),
    queryOne<{ count: string }>("SELECT count(*) FROM components"),
    queryOne<{ count: string }>("SELECT count(*) FROM shipments"),
    queryOne<{ count: string }>("SELECT count(*) FROM rfqs"),
    queryOne<{ sum: string | null }>(
      `SELECT COALESCE(SUM(oi.qty * oi.price),0) AS sum FROM order_items oi`
    ),
    queryOne<{ count: string }>("SELECT count(*) FROM components WHERE qty <= 0"),
    queryOne<{ count: string }>("SELECT count(*) FROM orders WHERE status = 'Pending'"),
    queryOne<{ count: string }>("SELECT count(*) FROM shipments WHERE status != 'Delivered'"),
  ]);

  return NextResponse.json({
    totalOrders: Number(orders?.count ?? 0),
    totalSuppliers: Number(suppliers?.count ?? 0),
    totalComponents: Number(components?.count ?? 0),
    totalShipments: Number(shipments?.count ?? 0),
    totalRfqs: Number(rfqs?.count ?? 0),
    totalSpend: Number(spend?.sum ?? 0),
    outOfStock: Number(outOfStock?.count ?? 0),
    pendingOrders: Number(pendingOrders?.count ?? 0),
    activeShipments: Number(activeShipments?.count ?? 0),
  });
}
