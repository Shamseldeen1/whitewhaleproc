"use client";

import DataTable, { ColumnConfig, FieldConfig } from "@/components/DataTable";
import { useSession } from "@/lib/useSession";

const columns: ColumnConfig[] = [
  { key: "order_num", label: "Order #" },
  { key: "bl", label: "B/L" },
  { key: "po_number", label: "PO Number" },
  { key: "division", label: "Division" },
  { key: "date_created", label: "Date Created" },
  { key: "creator_name", label: "Created By" },
  { key: "price", label: "Price", render: (r) => `${r.price ?? "—"} ${r.currency ?? ""}` },
];

const fields: FieldConfig[] = [
  { key: "order_num", label: "Order #" },
  { key: "bl", label: "B/L Number" },
  { key: "po_number", label: "PO Number" },
  { key: "division", label: "Division" },
  { key: "date_created", label: "Date Created", type: "date" },
  { key: "creator_name", label: "Created By" },
  { key: "price", label: "Price", type: "number" },
  { key: "currency", label: "Currency" },
  { key: "notes", label: "Notes", type: "textarea" },
];

export default function PurchaseOrdersPage() {
  const user = useSession();
  if (!user) return null;
  return (
    <DataTable
      title="PO Registry"
      subtitle="Internal purchase order registry — division, creator, and billed price."
      endpoint="/api/purchase-orders"
      columns={columns}
      fields={fields}
      role={user.role}
      emptyDefaults={{ currency: "USD" }}
    />
  );
}
