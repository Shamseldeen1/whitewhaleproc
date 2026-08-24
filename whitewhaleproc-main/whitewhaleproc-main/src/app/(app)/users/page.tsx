"use client";

import DataTable, { ColumnConfig, FieldConfig } from "@/components/DataTable";
import { useSession } from "@/lib/useSession";

const ROLES = ["admin", "user", "viewer"];

const columns: ColumnConfig[] = [
  { key: "username", label: "Username" },
  { key: "full_name", label: "Full Name" },
  { key: "role", label: "Role" },
];

const fields: FieldConfig[] = [
  { key: "username", label: "Username", required: true },
  { key: "full_name", label: "Full Name", required: true },
  { key: "role", label: "Role", type: "select", options: ROLES.map((r) => ({ value: r, label: r })) },
  { key: "password", label: "Password (leave blank to keep current)", type: "text" },
];

export default function UsersPage() {
  const user = useSession();
  if (!user) return null;
  if (user.role !== "admin") {
    return <p style={{ color: "var(--muted)" }}>Only admins can manage users.</p>;
  }
  return (
    <DataTable
      title="Users"
      subtitle="Accounts and roles — admin (full access), user (add/edit/delete), viewer (read-only)."
      endpoint="/api/users"
      columns={columns}
      fields={fields}
      role={user.role}
      emptyDefaults={{ role: "user" }}
    />
  );
}
