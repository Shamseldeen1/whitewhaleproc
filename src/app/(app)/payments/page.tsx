"use client";

import DataTable, { ColumnConfig, FieldConfig } from "@/components/DataTable";
import { useSession } from "@/lib/useSession";

const STATUSES = ["Balance Pending", "Fully Paid", "Overdue"];
const badgeClass: Record<string, string> = {
  "Fully Paid": "ww-badge-green",
  "Balance Pending": "ww-badge-amber",
  Overdue: "ww-badge-red",
};

const columns: ColumnConfig[] = [
  { key: "order_num", label: "Order #" },
  { key: "invoice_total", label: "Invoice Total" },
  { key: "deposit_amount", label: "Deposit Paid" },
  { key: "balance_due", label: "Balance Due" },
  { key: "balance_date", label: "Balance Date" },
  {
    key: "status",
    label: "Status",
    render: (r) => <span className={`ww-badge ${badgeClass[String(r.status)] ?? ""}`}>{String(r.status)}</span>,
  },
];

const fields: FieldConfig[] = [
  { key: "order_num", label: "Order #" },
  { key: "invoice_total", label: "Invoice Total", type: "number" },
  { key: "deposit_pct", label: "Deposit %", type: "number" },
  { key: "deposit_amount", label: "Deposit Amount", type: "number" },
  { key: "deposit_date", label: "Deposit Date", type: "date" },
  { key: "balance_due", label: "Balance Due", type: "number" },
  { key: "balance_date", label: "Balance Date", type: "date" },
  { key: "status", label: "Status", type: "select", options: STATUSES.map((s) => ({ value: s, label: s })) },
  { key: "notes", label: "Notes", type: "textarea" },
];

export default function PaymentsPage() {
  const user = useSession();
  if (!user) return null;
  return (
    <DataTable
      title="Payments"
      subtitle="Deposits, balances, and payment status against each order."
      endpoint="/api/payments"
      columns={columns}
      fields={fields}
      role={user.role}
      emptyDefaults={{ status: "Balance Pending" }}
    />
  );
}
