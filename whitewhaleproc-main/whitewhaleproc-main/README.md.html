# White Whale — Procurement System

A clean rebuild of the original single-file HTML prototype as a proper
Next.js app with a real Postgres backend, replacing the old
`localStorage`-only "database" and fake client-side login.

## Stack

- **Next.js 16** (App Router, TypeScript)
- **Postgres** — designed for **Vercel Postgres** (Neon), works with any
  standard Postgres
- **Auth** — JWT session cookie (HttpOnly), passwords hashed with bcrypt,
  three roles: `admin` (full access + user management), `user` (add/edit/
  delete records), `viewer` (read-only)

## Project layout

```
db/schema.sql        Full Postgres schema
db/seed.mjs           Seeds schema + sample data (same data as the original
                       HTML prototype) + 3 starter accounts
src/lib/db.ts          Postgres connection pool
src/lib/auth.ts        Password hashing + JWT session helpers
src/proxy.ts            Route protection (Next 16's middleware convention)
src/app/api/**          REST API — one folder per entity (suppliers,
                       components, orders, purchase-orders, shipments,
                       rfqs, payments, samples, users, dashboard)
src/app/(app)/**        Authenticated pages (sidebar shell + one page per
                       entity)
src/app/login           Login page
src/components/         Shared UI: Sidebar, generic DataTable (CRUD table
                       + modal form used by most entity pages)
```

## What's implemented

Full CRUD (create/read/update/delete), backed by real Postgres, for:
suppliers, components, orders (with line items), the PO registry,
shipments, RFQs (with supplier quotes), payments, samples/QC, and users —
all gated by role.

## What's not (yet) carried over from the original file

The original 4,500-line HTML also had an Excel export button, a BOM
matrix builder, and a set of pre-built printable reports (open orders,
price comparison, monthly summary, etc.). Those were left out of this
pass to keep the rebuild reviewable — the dashboard now pulls live
summary numbers from the database, and every entity's raw data is
available through its page, but the polished report screens themselves
would be a good next addition.

## Running locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env.local` and fill in:
   - `DATABASE_URL` — a Postgres connection string (see below for a local
     option)
   - `SESSION_SECRET` — any long random string, e.g. `openssl rand -base64 32`
3. Create the schema and seed sample data:
   ```bash
   npm run db:seed
   ```
   This prints the seeded admin login (`admin` / `Admin@123`) — **change
   this password after your first login.**
4. Start the dev server:
   ```bash
   npm run dev
   ```
5. Visit `http://localhost:3000` and log in.

**No local Postgres?** The fastest option is a free Neon database
(https://neon.tech) — create one, copy its connection string into
`DATABASE_URL`, and continue from step 3. This is the same underlying
service Vercel Postgres uses.

## Deploying to Vercel

1. **Push this project to GitHub** (or GitLab/Bitbucket) — Vercel deploys
   from a repo.
   ```bash
   git init
   git add .
   git commit -m "White Whale procurement — Next.js + Postgres rebuild"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```
2. **Import the project in Vercel**: go to
   https://vercel.com/new, select the repo, and click Deploy. Vercel
   auto-detects Next.js — no config needed.
3. **Attach a database**: in your new Vercel project, go to
   **Storage → Create Database → Postgres** (Neon-backed). Vercel
   automatically adds a `DATABASE_URL` environment variable to the
   project for you.
4. **Add the session secret**: Project → **Settings → Environment
   Variables** → add `SESSION_SECRET` with a long random value, for all
   environments (Production, Preview, Development).
5. **Seed the database** — the seed script needs to run once against the
   production database. From your machine, pull the production env vars
   down first, then run the seed script against them:
   ```bash
   npm i -g vercel      # if you don't have the CLI yet
   vercel link          # connect this folder to the Vercel project
   vercel env pull .env.local
   npm run db:seed
   ```
6. **Redeploy** (Vercel → Deployments → ⋯ → Redeploy) so the app picks up
   the new environment variables if it built before you added them.
7. Visit your `*.vercel.app` URL and log in with the seeded admin
   account, then change its password via the Users page.

## Roles

| Role   | Read | Create/Edit | Delete | Manage users |
|--------|------|--------------|--------|--------------|
| admin  | ✅   | ✅           | ✅     | ✅           |
| user   | ✅   | ✅           | ❌     | ❌           |
| viewer | ✅   | ❌           | ❌     | ❌           |
