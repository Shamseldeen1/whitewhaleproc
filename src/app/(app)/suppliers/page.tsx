"use client";

import DataTable, { ColumnConfig, FieldConfig } from "@/components/DataTable";
import { useSession } from "@/lib/useSession";

const columns: ColumnConfig[] = [
  { key: "code", label: "Code" },
  { key: "name", label: "Name" },
  { key: "country", label: "Country" },
  { key: "category", label: "Category" },
  { key: "contact", label: "Contact" },
  { key: "email", label: "Email" },
  { key: "rating", label: "Rating" },
];

const fields: FieldConfig[] = [
  { key: "code", label: "Supplier Code", required: true },
  { key: "name", label: "Name", required: true },
  { key: "country", label: "Country" },
  { key: "category", label: "Category" },
  { key: "contact", label: "Contact Person" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "rating", label: "Rating (0-5)", type: "number" },
  { key: "notes", label: "Notes", type: "textarea" },
];

export default function SuppliersPage() {
  const user = useSession();
  if (!user) return null;
  return (
    <DataTable
      title="Suppliers"
      subtitle="All approved and prospective suppliers on file."
      endpoint="/api/suppliers"
      columns={columns}
      fields={fields}
      role={user.role}
    />
  );
}
