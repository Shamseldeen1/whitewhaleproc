"use client";

import { useEffect, useState, useCallback } from "react";
import { apiGet, apiSend } from "@/lib/api";
import { useSession } from "@/lib/useSession";

interface Supplier {
  id: string;
  name: string;
}
interface Quote {
  supplier_id: string;
  supplier_name?: string;
  price: number;
  lead_time: string;
  moq: string;
  terms: string;
  warranty: string;
}
interface Rfq {
  num: string;
  component: string;
  qty: number;
  target_price: number | null;
  deadline: string | null;
  status: string;
  awarded_supplier: string | null;
  quotes: Quote[];
}

const STATUSES = ["Comparing", "Awarded", "Cancelled"];
const badgeClass: Record<string, string> = {
  Comparing: "ww-badge-amber",
  Awarded: "ww-badge-green",
  Cancelled: "ww-badge-red",
};

function emptyForm(): Partial<Rfq> {
  return {
    num: "",
    component: "",
    qty: 1,
    target_price: 0,
    deadline: "",
    status: "Comparing",
    awarded_supplier: "",
    quotes: [{ supplier_id: "", price: 0, lead_time: "", moq: "", terms: "", warranty: "" }],
  };
}

export default function RfqsPage() {
  const user = useSession();
  const [rfqs, setRfqs] = useState<Rfq[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNum, setEditingNum] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Rfq>>(emptyForm());

  const canWrite = user?.role === "admin" || user?.role === "user";
  const canDelete = user?.role === "admin";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [r, s] = await Promise.all([apiGet<Rfq[]>("/api/rfqs"), apiGet<Supplier[]>("/api/suppliers")]);
      setRfqs(r);
      setSuppliers(s);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load RFQs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openAdd() {
    setEditingNum(null);
    setForm(emptyForm());
    setModalOpen(true);
  }

  function openEdit(r: Rfq) {
    setEditingNum(r.num);
    setForm({ ...r, deadline: r.deadline?.slice(0, 10) ?? "" });
    setModalOpen(true);
  }

  function updateQuote(idx: number, patch: Partial<Quote>) {
    const quotes = [...(form.quotes ?? [])];
    quotes[idx] = { ...quotes[idx], ...patch };
    setForm({ ...form, quotes });
  }

  function addQuoteRow() {
    setForm({ ...form, quotes: [...(form.quotes ?? []), { supplier_id: "", price: 0, lead_time: "", moq: "", terms: "", warranty: "" }] });
  }

  function removeQuoteRow(idx: number) {
    setForm({ ...form, quotes: (form.quotes ?? []).filter((_, i) => i !== idx) });
  }

  async function handleSave() {
    try {
      if (editingNum) {
        await apiSend(`/api/rfqs/${editingNum}`, "PUT", form);
      } else {
        await apiSend("/api/rfqs", "POST", form);
      }
      setModalOpen(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    }
  }

  async function handleDelete(r: Rfq) {
    if (!confirm(`Delete RFQ ${r.num}?`)) return;
    try {
      await apiSend(`/api/rfqs/${r.num}`, "DELETE");
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
            RFQs
          </h1>
          <p style={{ fontSize: 13, color: "var(--muted)" }}>Requests for quote, with supplier quote comparisons.</p>
        </div>
        {canWrite && (
          <button className="ww-btn ww-btn-primary" onClick={openAdd}>
            + Add RFQ
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
                  <th className="text-left py-2 px-2">RFQ #</th>
                  <th className="text-left py-2 px-2">Component</th>
                  <th className="text-left py-2 px-2">Qty</th>
                  <th className="text-left py-2 px-2">Target Price</th>
                  <th className="text-left py-2 px-2">Deadline</th>
                  <th className="text-left py-2 px-2">Quotes</th>
                  <th className="text-left py-2 px-2">Status</th>
                  {(canWrite || canDelete) && <th className="text-left py-2 px-2">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {rfqs.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-6 text-center" style={{ color: "var(--muted)" }}>
                      No RFQs yet.
                    </td>
                  </tr>
                )}
                {rfqs.map((r) => (
                  <tr key={r.num} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td className="py-2 px-2 font-semibold">{r.num}</td>
                    <td className="py-2 px-2">{r.component}</td>
                    <td className="py-2 px-2">{r.qty}</td>
                    <td className="py-2 px-2">{r.target_price ?? "—"}</td>
                    <td className="py-2 px-2">{r.deadline?.slice(0, 10) ?? "—"}</td>
                    <td className="py-2 px-2">{r.quotes.length}</td>
                    <td className="py-2 px-2">
                      <span className={`ww-badge ${badgeClass[r.status] ?? ""}`}>{r.status}</span>
                    </td>
                    {(canWrite || canDelete) && (
                      <td className="py-2 px-2 flex gap-2">
                        {canWrite && (
                          <button className="ww-btn ww-btn-outline" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => openEdit(r)}>
                            Edit
                          </button>
                        )}
                        {canDelete && (
                          <button className="ww-btn ww-btn-danger" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => handleDelete(r)}>
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
          <div className="ww-card p-6" style={{ width: 600, maxHeight: "88vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4" style={{ color: "var(--navy)" }}>
              {editingNum ? "Edit RFQ" : "Add RFQ"}
            </h2>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-bold uppercase mb-1" style={{ color: "var(--muted)" }}>RFQ #</label>
                <input className="ww-input" disabled={!!editingNum} value={form.num ?? ""} onChange={(e) => setForm({ ...form, num: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1" style={{ color: "var(--muted)" }}>Component</label>
                <input className="ww-input" value={form.component ?? ""} onChange={(e) => setForm({ ...form, component: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1" style={{ color: "var(--muted)" }}>Qty</label>
                <input type="number" className="ww-input" value={form.qty ?? 1} onChange={(e) => setForm({ ...form, qty: Number(e.target.value) })} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1" style={{ color: "var(--muted)" }}>Target Price</label>
                <input type="number" className="ww-input" value={form.target_price ?? 0} onChange={(e) => setForm({ ...form, target_price: Number(e.target.value) })} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1" style={{ color: "var(--muted)" }}>Deadline</label>
                <input type="date" className="ww-input" value={form.deadline ?? ""} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1" style={{ color: "var(--muted)" }}>Status</label>
                <select className="ww-input" value={form.status ?? "Comparing"} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1" style={{ color: "var(--muted)" }}>Awarded Supplier</label>
                <select className="ww-input" value={form.awarded_supplier ?? ""} onChange={(e) => setForm({ ...form, awarded_supplier: e.target.value })}>
                  <option value="">—</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <label className="block text-xs font-bold uppercase mb-1" style={{ color: "var(--muted)" }}>Supplier Quotes</label>
            <div className="flex flex-col gap-2 mb-2">
              {(form.quotes ?? []).map((q, idx) => (
                <div key={idx} className="grid gap-2" style={{ gridTemplateColumns: "1.4fr 0.8fr 0.8fr 0.6fr 1fr auto" }}>
                  <select className="ww-input" value={q.supplier_id} onChange={(e) => updateQuote(idx, { supplier_id: e.target.value })}>
                    <option value="">Supplier</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <input className="ww-input" type="number" placeholder="Price" value={q.price} onChange={(e) => updateQuote(idx, { price: Number(e.target.value) })} />
                  <input className="ww-input" placeholder="Lead time" value={q.lead_time} onChange={(e) => updateQuote(idx, { lead_time: e.target.value })} />
                  <input className="ww-input" placeholder="MOQ" value={q.moq} onChange={(e) => updateQuote(idx, { moq: e.target.value })} />
                  <input className="ww-input" placeholder="Terms" value={q.terms} onChange={(e) => updateQuote(idx, { terms: e.target.value })} />
                  <button className="ww-btn ww-btn-danger" style={{ padding: "4px 8px" }} onClick={() => removeQuoteRow(idx)}>
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <button className="ww-btn ww-btn-outline" style={{ fontSize: 12 }} onClick={addQuoteRow}>
              + Add Quote
            </button>

            <div className="flex justify-end gap-2 mt-5">
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
