"use client";

import { useEffect, useState } from "react";
import DataTable, { ColumnConfig, FieldConfig } from "@/components/DataTable";
import { useSession } from "@/lib/useSession";
import { apiGet } from "@/lib/api";

interface Supplier {
  id: string;
  name: string;
}

const STATUSES = ["In Transit", "Delivered", "Delayed", "Customs Hold"];
const badgeClass: Record<string, string> = {
  Delivered: "ww-badge-green",
  "In Transit": "ww-badge-blue",
  Delayed: "ww-badge-amber",
  "Customs Hold": "ww-badge-red",
};

const columns: ColumnConfig[] = [
  { key: "bl", label: "B/L Number" },
  { key: "supplier_name", label: "Supplier" },
  { key: "pol", label: "POL" },
  { key: "pod", label: "POD" },
  { key: "ship_date", label: "Ship Date" },
  { key: "eta", label: "ETA" },
  {
    key: "status",
    label: "Status",
    render: (r) => <span className={`ww-badge ${badgeClass[String(r.status)] ?? ""}`}>{String(r.status)}</span>,
  },
];

export default function ShipmentsPage() {
  const user = useSession();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  useEffect(() => {
    apiGet<Supplier[]>("/api/suppliers").then(setSuppliers).catch(() => {});
  }, []);

  if (!user) return null;

  const fields: FieldConfig[] = [
    { key: "bl", label: "B/L Number", required: true },
    { key: "acid", label: "ACID" },
    {
      key: "supplier_id",
      label: "Supplier",
      type: "select",
      options: suppliers.map((s) => ({ value: s.id, label: s.name })),
    },
    { key: "order_num", label: "Order #" },
    { key: "vessel", label: "Vessel" },
    { key: "pol", label: "Port of Loading" },
    { key: "pod", label: "Port of Discharge" },
    { key: "incoterms", label: "Incoterms" },
    { key: "ship_date", label: "Ship Date", type: "date" },
    { key: "eta", label: "ETA", type: "date" },
    { key: "arrival", label: "Arrival", type: "date" },
    { key: "status", label: "Status", type: "select", options: STATUSES.map((s) => ({ value: s, label: s })) },
    { key: "remarks", label: "Remarks", type: "textarea" },
  ];

  return (
    <DataTable
      title="Shipments"
      subtitle="Status, routing, and transit timing for every recorded shipment."
      endpoint="/api/shipments"
      columns={columns}
      fields={fields}
      role={user.role}
      emptyDefaults={{ status: "In Transit" }}
    />
  );
}
