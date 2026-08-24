"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { SessionUser } from "@/lib/auth";

const NAV = [
  { section: "Overview", items: [{ href: "/dashboard", label: "Dashboard", icon: "📊" }] },
  {
    section: "Procurement",
    items: [
      { href: "/suppliers", label: "Suppliers", icon: "🏭" },
      { href: "/inventory", label: "Components", icon: "🔩" },
      { href: "/orders", label: "Orders", icon: "🧾" },
      { href: "/purchase-orders", label: "PO Registry", icon: "📋" },
      { href: "/rfqs", label: "RFQs", icon: "📝" },
    ],
  },
  {
    section: "Logistics & Finance",
    items: [
      { href: "/shipments", label: "Shipments", icon: "🚢" },
      { href: "/payments", label: "Payments", icon: "💳" },
      { href: "/samples", label: "Samples & QC", icon: "🧪" },
    ],
  },
];

export default function Sidebar({ user }: { user: SessionUser }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside
      className="flex flex-col fixed top-0 left-0 bottom-0"
      style={{ width: "var(--sidebar-w)", background: "var(--navy)", color: "#fff", zIndex: 100 }}
    >
      <div style={{ padding: "20px 18px 14px", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 20, fontWeight: 800, letterSpacing: 1 }}>
          WHITE <span style={{ color: "var(--accent)" }}>WHALE</span>
        </div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)", letterSpacing: 1.5, textTransform: "uppercase" }}>
          Procurement
        </div>
      </div>

      <div style={{ padding: "12px 18px", borderBottom: "1px solid rgba(255,255,255,.08)", display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 34, height: 34, borderRadius: "50%", background: "var(--accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: 14, color: "var(--navy)", flexShrink: 0,
          }}
        >
          {user.full_name.slice(0, 1).toUpperCase()}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{user.full_name}</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)", textTransform: "capitalize" }}>{user.role}</div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: "10px 0", overflowY: "auto" }}>
        {NAV.map((section) => (
          <div key={section.section}>
            <div style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,.22)", padding: "12px 18px 3px" }}>
              {section.section}
            </div>
            {section.items.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: "flex", alignItems: "center", gap: 11, padding: "10px 18px",
                    fontSize: 13.5, fontWeight: 500,
                    color: active ? "var(--accent)" : "rgba(255,255,255,.6)",
                    background: active ? "rgba(0,184,217,.13)" : "transparent",
                    borderLeft: active ? "3px solid var(--accent)" : "3px solid transparent",
                  }}
                >
                  <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
        {user.role === "admin" && (
          <div>
            <div style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,.22)", padding: "12px 18px 3px" }}>
              Admin
            </div>
            <Link
              href="/users"
              style={{
                display: "flex", alignItems: "center", gap: 11, padding: "10px 18px",
                fontSize: 13.5, fontWeight: 500,
                color: pathname.startsWith("/users") ? "var(--accent)" : "rgba(255,255,255,.6)",
                background: pathname.startsWith("/users") ? "rgba(0,184,217,.13)" : "transparent",
                borderLeft: pathname.startsWith("/users") ? "3px solid var(--accent)" : "3px solid transparent",
              }}
            >
              <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>👤</span>
              Users
            </Link>
          </div>
        )}
      </nav>

      <div style={{ padding: "12px 18px", borderTop: "1px solid rgba(255,255,255,.08)" }}>
        <button
          onClick={logout}
          style={{
            width: "100%", padding: 9, background: "rgba(229,62,62,.15)", color: "#fc8181",
            border: "1px solid rgba(229,62,62,.3)", borderRadius: 8, cursor: "pointer",
            fontSize: 13, fontWeight: 600,
          }}
        >
          Log out
        </button>
      </div>
    </aside>
  );
}
