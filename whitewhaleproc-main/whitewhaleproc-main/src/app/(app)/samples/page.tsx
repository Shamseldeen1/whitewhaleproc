"use client";

import DataTable, { ColumnConfig, FieldConfig } from "@/components/DataTable";
import { useSession } from "@/lib/useSession";

const columns: ColumnConfig[] = [
  { key: "sample_date", label: "Date" },
  { key: "supplier_name", label: "Supplier" },
  { key: "item_desc", label: "Item" },
  { key: "qty_received", label: "Received" },
  { key: "qty_accepted", label: "Accepted" },
  { key: "qty_rejected", label: "Rejected" },
  {
    key: "report_received",
    label: "QC Report",
    render: (r) => (
      <span className={`ww-badge ${r.report_received === "yes" ? "ww-badge-green" : "ww-badge-amber"}`}>
        {r.report_received === "yes" ? "Received" : "Pending"}
      </span>
    ),
  },
];

const fields: FieldConfig[] = [
  { key: "sample_date", label: "Date", type: "date" },
  { key: "supplier_name", label: "Supplier" },
  { key: "item_desc", label: "Item Description", type: "textarea" },
  { key: "qty_received", label: "Qty Received", type: "number" },
  { key: "qty_accepted", label: "Qty Accepted", type: "number" },
  { key: "qty_rejected", label: "Qty Rejected", type: "number" },
  {
    key: "report_received",
    label: "QC Report Received",
    type: "select",
    options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }],
  },
  { key: "notes", label: "Notes", type: "textarea" },
];

export default function SamplesPage() {
  const user = useSession();
  if (!user) return null;
  return (
    <DataTable
      title="Samples & QC"
      subtitle="Incoming sample evaluations and quality-control outcomes."
      endpoint="/api/samples"
      columns={columns}
      fields={fields}
      role={user.role}
      emptyDefaults={{ report_received: "no" }}
    />
  );
}
