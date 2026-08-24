import { Pool } from "pg";

declare global {
  var _pgPool: Pool | undefined;
}

function createPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Add it in your .env.local (dev) or Vercel Project → Settings → Environment Variables (prod)."
    );
  }
  return new Pool({
    connectionString,
    ssl: connectionString.includes("localhost")
      ? false
      : { rejectUnauthorized: false },
  });
}

// Reuse the pool across hot reloads in dev and across serverless
// invocations within the same warm lambda in prod.
export const pool = global._pgPool ?? createPool();
if (process.env.NODE_ENV !== "production") {
  global._pgPool = pool;
}

export async function query<T = unknown>(text: string, params?: unknown[]) {
  const result = await pool.query(text, params);
  return result.rows as T[];
}

export async function queryOne<T = unknown>(text: string, params?: unknown[]) {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}
