"use client";

import { useEffect, useState } from "react";
import DataTable, { ColumnConfig, FieldConfig } from "@/components/DataTable";
import { useSession } from "@/lib/useSession";
import { apiGet } from "@/lib/api";

interface Supplier {
  id: string;
  name: string;
}

const columns: ColumnConfig[] = [
  { key: "code", label: "Part Code" },
  { key: "description", label: "Description" },
  { key: "supplier_name", label: "Supplier" },
  {
    key: "price",
    label: "Unit Price",
    render: (r) => `${r.price} ${r.currency}`,
  },
  { key: "unit", label: "Unit" },
  {
    key: "qty",
    label: "Stock",
    render: (r) => (
      <span className={`ww-badge ${Number(r.qty) <= 0 ? "ww-badge-red" : "ww-badge-green"}`}>
        {String(r.qty)}
      </span>
    ),
  },
];

export default function InventoryPage() {
  const user = useSession();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  useEffect(() => {
    apiGet<Supplier[]>("/api/suppliers").then(setSuppliers).catch(() => {});
  }, []);

  if (!user) return null;

  const fields: FieldConfig[] = [
    { key: "code", label: "Part Code", required: true },
    { key: "description", label: "Description", required: true },
    {
      key: "supplier_id",
      label: "Supplier",
      type: "select",
      options: suppliers.map((s) => ({ value: s.id, label: s.name })),
    },
    { key: "price", label: "Unit Price", type: "number" },
    { key: "currency", label: "Currency" },
    { key: "unit", label: "Unit" },
    { key: "qty", label: "Stock Qty", type: "number" },
  ];

  return (
    <DataTable
      title="Components"
      subtitle="Every part on file, its supplier, unit price, and current stock."
      endpoint="/api/components"
      columns={columns}
      fields={fields}
      role={user.role}
      emptyDefaults={{ currency: "USD", unit: "Piece" }}
    />
  );
}
