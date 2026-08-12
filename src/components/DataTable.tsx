"use client";

import { useEffect, useState, useCallback } from "react";
import { apiGet, apiSend } from "@/lib/api";
import type { Role } from "@/lib/auth";

export interface FieldConfig {
  key: string;
  label: string;
  type?: "text" | "number" | "date" | "select" | "textarea";
  options?: { value: string; label: string }[];
  required?: boolean;
}

export interface ColumnConfig {
  key: string;
  label: string;
  render?: (row: Record<string, unknown>) => React.ReactNode;
}

interface DataTableProps {
  title: string;
  subtitle?: string;
  endpoint: string; // e.g. "/api/suppliers"
  idKey?: string; // defaults to "id"
  columns: ColumnConfig[];
  fields: FieldConfig[];
  role: Role;
  emptyDefaults?: Record<string, unknown>;
}

export default function DataTable({
  title,
  subtitle,
  endpoint,
  idKey = "id",
  columns,
  fields,
  role,
  emptyDefaults = {},
}: DataTableProps) {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const canWrite = role === "admin" || role === "user";
  const canDelete = role === "admin";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGet<Record<string, unknown>[]>(endpoint);
      setRows(data);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    load();
  }, [load]);

  function openAdd() {
    setEditing(null);
    setForm({ ...emptyDefaults });
    setModalOpen(true);
  }

  function openEdit(row: Record<string, unknown>) {
    setEditing(row);
    setForm({ ...row });
    setModalOpen(true);
  }

  async function handleSave() {
    try {
      if (editing) {
        await apiSend(`${endpoint}/${editing[idKey]}`, "PUT", form);
      } else {
        await apiSend(endpoint, "POST", form);
      }
      setModalOpen(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    }
  }

  async function handleDelete(row: Record<string, unknown>) {
    if (!confirm("Delete this record? This cannot be undone.")) return;
    try {
      await apiSend(`${endpoint}/${row[idKey]}`, "DELETE");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  }

  const filtered = search
    ? rows.filter((r) =>
        JSON.stringify(r).toLowerCase().includes(search.toLowerCase())
      )
    : rows;

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div>
          <h1
            className="text-2xl font-extrabold"
            style={{ color: "var(--navy)", fontFamily: "'Barlow Condensed',sans-serif" }}
          >
            {title}
          </h1>
          {subtitle && <p className="text-sm" style={{ color: "var(--muted)" }}>{subtitle}</p>}
        </div>
        {canWrite && (
          <button className="ww-btn ww-btn-primary" onClick={openAdd}>
            + Add
          </button>
        )}
      </div>

      <div className="ww-card p-4">
        <div className="mb-3">
          <input
            className="ww-input"
            style={{ width: 240 }}
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {error && <p className="text-sm mb-2" style={{ color: "var(--danger)" }}>{error}</p>}

        {loading ? (
          <p className="text-sm" style={{ color: "var(--muted)" }}>Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {columns.map((c) => (
                    <th key={c.key} className="text-left py-2 px-2 font-semibold" style={{ color: "var(--navy)" }}>
                      {c.label}
                    </th>
                  ))}
                  {(canWrite || canDelete) && <th className="text-left py-2 px-2">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={columns.length + 1} className="py-6 text-center" style={{ color: "var(--muted)" }}>
                      No records yet.
                    </td>
                  </tr>
                )}
                {filtered.map((row) => (
                  <tr key={String(row[idKey])} style={{ borderBottom: "1px solid var(--border)" }}>
                    {columns.map((c) => (
                      <td key={c.key} className="py-2 px-2">
                        {c.render ? c.render(row) : String(row[c.key] ?? "—")}
                      </td>
                    ))}
                    {(canWrite || canDelete) && (
                      <td className="py-2 px-2 flex gap-2">
                        {canWrite && (
                          <button className="ww-btn ww-btn-outline" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => openEdit(row)}>
                            Edit
                          </button>
                        )}
                        {canDelete && (
                          <button className="ww-btn ww-btn-danger" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => handleDelete(row)}>
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
          <div
            className="ww-card p-6"
            style={{ width: 460, maxHeight: "85vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-4" style={{ color: "var(--navy)" }}>
              {editing ? "Edit" : "Add"} {title.replace(/s$/, "")}
            </h2>
            <div className="flex flex-col gap-3">
              {fields.map((f) => (
                <div key={f.key}>
                  <label className="block text-xs font-bold uppercase mb-1" style={{ color: "var(--muted)", letterSpacing: 1 }}>
                    {f.label}
                  </label>
                  {f.type === "select" ? (
                    <select
                      className="ww-input"
                      value={(form[f.key] as string) ?? ""}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    >
                      <option value="">—</option>
                      {f.options?.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  ) : f.type === "textarea" ? (
                    <textarea
                      className="ww-input"
                      rows={3}
                      value={(form[f.key] as string) ?? ""}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    />
                  ) : (
                    <input
                      className="ww-input"
                      type={f.type ?? "text"}
                      value={(form[f.key] as string | number) ?? ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          [f.key]: f.type === "number" ? Number(e.target.value) : e.target.value,
                        })
                      }
                    />
                  )}
                </div>
              ))}
            </div>
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
