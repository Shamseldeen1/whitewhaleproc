"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

interface Stats {
  totalOrders: number;
  totalSuppliers: number;
  totalComponents: number;
  totalShipments: number;
  totalRfqs: number;
  totalSpend: number;
  outOfStock: number;
  pendingOrders: number;
  activeShipments: number;
}

function StatCard({ num, label, color }: { num: string | number; label: string; color?: string }) {
  return (
    <div className="ww-card p-4" style={{ borderLeft: `4px solid ${color ?? "var(--accent)"}` }}>
      <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 28, fontWeight: 800, color: "var(--navy)" }}>
        {num}
      </div>
      <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 500, marginTop: 2 }}>{label}</div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    apiGet<Stats>("/api/dashboard").then(setStats).catch(() => {});
  }, []);

  return (
    <div>
      <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 22, fontWeight: 800, color: "var(--navy)" }}>
        Dashboard
      </h1>
      <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 20 }}>
        Live overview of spend, orders, shipments, and stock.
      </p>

      {!stats ? (
        <p style={{ color: "var(--muted)" }}>Loading...</p>
      ) : (
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
          <StatCard num={stats.totalSpend.toLocaleString()} label="Total Spend (USD)" color="var(--blue)" />
          <StatCard num={stats.totalOrders} label="Total Orders" />
          <StatCard num={stats.pendingOrders} label="Pending Orders" color="var(--accent2)" />
          <StatCard num={stats.activeShipments} label="Active Shipments" />
          <StatCard num={stats.outOfStock} label="Out of Stock" color="var(--danger)" />
          <StatCard num={stats.totalSuppliers} label="Suppliers" color="var(--success)" />
          <StatCard num={stats.totalComponents} label="Components on File" />
          <StatCard num={stats.totalRfqs} label="RFQs" />
        </div>
      )}
    </div>
  );
}
