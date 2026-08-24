"use client";

import { useEffect, useState, useCallback } from "react";
import { apiGet, apiSend } from "@/lib/api";
import { useSession } from "@/lib/useSession";

interface Supplier {
  id: string;
  name: string;
}
interface OrderItem {
  desc: string;
  qty: number;
  unit: string;
  price: number;
}
interface Order {
  id: string;
  num: string;
  pi_number: string | null;
  order_date: string;
  supplier_id: string | null;
  supplier_name: string | null;
  model_code: string | null;
  currency: string;
  status: string;
  incoterm: string | null;
  lead_time: string | null;
  notes: string | null;
  items: OrderItem[];
}

const STATUSES = ["Pending", "Approved", "Received", "Cancelled"];
const badgeClass: Record<string, string> = {
  Pending: "ww-badge-amber",
  Approved: "ww-badge-blue",
  Received: "ww-badge-green",
  Cancelled: "ww-badge-red",
};

function emptyForm(): Partial<Order> {
  return {
    num: "",
    pi_number: "",
    order_date: new Date().toISOString().slice(0, 10),
    supplier_id: "",
    model_code: "",
    currency: "USD",
    status: "Pending",
    incoterm: "",
    lead_time: "",
    notes: "",
    items: [{ desc: "", qty: 1, unit: "Piece", price: 0 }],
  };
}

export default function OrdersPage() {
  const user = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Order>>(emptyForm());

  const canWrite = user?.role === "admin" || user?.role === "user";
  const canDelete = user?.role === "admin";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [o, s] = await Promise.all([apiGet<Order[]>("/api/orders"), apiGet<Supplier[]>("/api/suppliers")]);
      setOrders(o);
      setSuppliers(s);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function orderTotal(o: Order | Partial<Order>) {
    return (o.items ?? []).reduce((sum, it) => sum + Number(it.qty || 0) * Number(it.price || 0), 0);
  }

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm());
    setModalOpen(true);
  }

  function openEdit(o: Order) {
    setEditingId(o.id);
    setForm({ ...o, order_date: o.order_date?.slice(0, 10) });
    setModalOpen(true);
  }

  function updateItem(idx: number, patch: Partial<OrderItem>) {
    const items = [...(form.items ?? [])];
    items[idx] = { ...items[idx], ...patch };
    setForm({ ...form, items });
  }

  function addItemRow() {
    setForm({ ...form, items: [...(form.items ?? []), { desc: "", qty: 1, unit: "Piece", price: 0 }] });
  }

  function removeItemRow(idx: number) {
    setForm({ ...form, items: (form.items ?? []).filter((_, i) => i !== idx) });
  }

  async function handleSave() {
    try {
      if (editingId) {
        await apiSend(`/api/orders/${editingId}`, "PUT", form);
      } else {
        await apiSend("/api/orders", "POST", form);
      }
      setModalOpen(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    }
  }

  async function handleDelete(o: Order) {
    if (!confirm(`Delete order ${o.num}?`)) return;
    try {
      await apiSend(`/api/orders/${o.id}`, "DELETE");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  }

  if (!user) return null;

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div>
          <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 22, fontWeight: 800, color: "var(--navy)" }}>
            Orders
          </h1>
          <p style={{ fontSize: 13, color: "var(--muted)" }}>Purchase orders raised against suppliers, with line items.</p>
        </div>
        {canWrite && (
          <button className="ww-btn ww-btn-primary" onClick={openAdd}>
            + Add Order
          </button>
        )}
      </div>

      <div className="ww-card p-4">
        {error && <p style={{ color: "var(--danger)", fontSize: 13, marginBottom: 8 }}>{error}</p>}
        {loading ? (
          <p style={{ color: "var(--muted)" }}>Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <th className="text-left py-2 px-2">Order #</th>
                  <th className="text-left py-2 px-2">PI Number</th>
                  <th className="text-left py-2 px-2">Supplier</th>
                  <th className="text-left py-2 px-2">Status</th>
                  <th className="text-left py-2 px-2">Lead Time</th>
                  <th className="text-left py-2 px-2">Total</th>
                  {(canWrite || canDelete) && <th className="text-left py-2 px-2">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-6 text-center" style={{ color: "var(--muted)" }}>
                      No orders yet.
                    </td>
                  </tr>
                )}
                {orders.map((o) => (
                  <tr key={o.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td className="py-2 px-2 font-semibold">{o.num}</td>
                    <td className="py-2 px-2">{o.pi_number || "—"}</td>
                    <td className="py-2 px-2">{o.supplier_name || "—"}</td>
                    <td className="py-2 px-2">
                      <span className={`ww-badge ${badgeClass[o.status] ?? ""}`}>{o.status}</span>
                    </td>
                    <td className="py-2 px-2">{o.lead_time || "—"}</td>
                    <td className="py-2 px-2 font-semibold">
                      {orderTotal(o).toLocaleString()} {o.currency}
                    </td>
                    {(canWrite || canDelete) && (
                      <td className="py-2 px-2 flex gap-2">
                        {canWrite && (
                          <button className="ww-btn ww-btn-outline" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => openEdit(o)}>
                            Edit
                          </button>
                        )}
                        {canDelete && (
                          <button className="ww-btn ww-btn-danger" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => handleDelete(o)}>
                            Delete
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ background: "rgba(11,31,58,.45)", zIndex: 200 }}
          onClick={() => setModalOpen(false)}
        >
          <div className="ww-card p-6" style={{ width: 560, maxHeight: "88vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4" style={{ color: "var(--navy)" }}>
              {editingId ? "Edit Order" : "Add Order"}
            </h2>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-bold uppercase mb-1" style={{ color: "var(--muted)" }}>Order #</label>
                <input className="ww-input" value={form.num ?? ""} onChange={(e) => setForm({ ...form, num: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1" style={{ color: "var(--muted)" }}>PI Number</label>
                <input className="ww-input" value={form.pi_number ?? ""} onChange={(e) => setForm({ ...form, pi_number: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1" style={{ color: "var(--muted)" }}>Order Date</label>
                <input type="date" className="ww-input" value={form.order_date ?? ""} onChange={(e) => setForm({ ...form, order_date: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1" style={{ color: "var(--muted)" }}>Supplier</label>
                <select className="ww-input" value={form.supplier_id ?? ""} onChange={(e) => setForm({ ...form, supplier_id: e.target.value })}>
                  <option value="">—</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1" style={{ color: "var(--muted)" }}>Status</label>
                <select className="ww-input" value={form.status ?? "Pending"} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1" style={{ color: "var(--muted)" }}>Currency</label>
                <input className="ww-input" value={form.currency ?? "USD"} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1" style={{ color: "var(--muted)" }}>Incoterm</label>
                <input className="ww-input" value={form.incoterm ?? ""} onChange={(e) => setForm({ ...form, incoterm: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1" style={{ color: "var(--muted)" }}>Lead Time</label>
                <input className="ww-input" value={form.lead_time ?? ""} onChange={(e) => setForm({ ...form, lead_time: e.target.value })} />
              </div>
            </div>

            <label className="block text-xs font-bold uppercase mb-1" style={{ color: "var(--muted)" }}>Line Items</label>
            <div className="flex flex-col gap-2 mb-2">
              {(form.items ?? []).map((it, idx) => (
                <div key={idx} className="grid gap-2" style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr auto" }}>
                  <input className="ww-input" placeholder="Description" value={it.desc} onChange={(e) => updateItem(idx, { desc: e.target.value })} />
                  <input className="ww-input" type="number" placeholder="Qty" value={it.qty} onChange={(e) => updateItem(idx, { qty: Number(e.target.value) })} />
                  <input className="ww-input" placeholder="Unit" value={it.unit} onChange={(e) => updateItem(idx, { unit: e.target.value })} />
                  <input className="ww-input" type="number" placeholder="Price" value={it.price} onChange={(e) => updateItem(idx, { price: Number(e.target.value) })} />
                  <button className="ww-btn ww-btn-danger" style={{ padding: "4px 8px" }} onClick={() => removeItemRow(idx)}>
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <button className="ww-btn ww-btn-outline" style={{ fontSize: 12 }} onClick={addItemRow}>
              + Add Item
            </button>

            <div className="text-right font-bold mt-4" style={{ color: "var(--blue)" }}>
              Total: {orderTotal(form).toLocaleString()} {form.currency}
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button className="ww-btn" style={{ background: "#eef2f7", color: "var(--text)" }} onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button className="ww-btn ww-btn-primary" onClick={handleSave}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
