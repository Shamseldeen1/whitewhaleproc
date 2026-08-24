-- White Whale Procurement — schema
-- Works on Vercel Postgres (Neon) or any standard Postgres.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username      TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name     TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('admin','user','viewer')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS suppliers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  country     TEXT,
  contact     TEXT,
  email       TEXT,
  phone       TEXT,
  category    TEXT,
  rating      NUMERIC,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS components (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  price       NUMERIC NOT NULL DEFAULT 0,
  currency    TEXT NOT NULL DEFAULT 'USD',
  unit        TEXT NOT NULL DEFAULT 'Piece',
  qty         NUMERIC NOT NULL DEFAULT 0,
  photo_data  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS models (
  id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code  TEXT UNIQUE NOT NULL,
  name  TEXT NOT NULL,
  type  TEXT
);

CREATE TABLE IF NOT EXISTS bom (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_code   TEXT NOT NULL REFERENCES models(code) ON DELETE CASCADE,
  component_id UUID NOT NULL REFERENCES components(id) ON DELETE CASCADE,
  qty          NUMERIC NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS orders (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  num         TEXT UNIQUE NOT NULL,
  pi_number   TEXT,
  order_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  model_code  TEXT,
  currency    TEXT NOT NULL DEFAULT 'USD',
  status      TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending','Approved','Received','Cancelled')),
  incoterm    TEXT,
  lead_time   TEXT,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id  UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  desc_text TEXT NOT NULL,
  qty       NUMERIC NOT NULL DEFAULT 1,
  unit      TEXT NOT NULL DEFAULT 'Piece',
  price     NUMERIC NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS purchase_orders (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_num     TEXT REFERENCES orders(num) ON DELETE SET NULL,
  bl            TEXT,
  po_number     TEXT,
  division      TEXT,
  date_created  DATE,
  creator_name  TEXT,
  price         NUMERIC,
  currency      TEXT DEFAULT 'USD',
  notes         TEXT
);

CREATE TABLE IF NOT EXISTS shipments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bl          TEXT UNIQUE NOT NULL,
  acid        TEXT,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  order_num   TEXT REFERENCES orders(num) ON DELETE SET NULL,
  vessel      TEXT,
  pol         TEXT,
  pod         TEXT,
  incoterms   TEXT,
  ship_date   DATE,
  eta         DATE,
  arrival     DATE,
  status      TEXT NOT NULL DEFAULT 'In Transit' CHECK (status IN ('In Transit','Delivered','Delayed','Customs Hold')),
  remarks     TEXT
);

CREATE TABLE IF NOT EXISTS rfqs (
  num             TEXT PRIMARY KEY,
  component       TEXT NOT NULL,
  qty             NUMERIC NOT NULL DEFAULT 1,
  target_price    NUMERIC,
  deadline        DATE,
  status          TEXT NOT NULL DEFAULT 'Comparing' CHECK (status IN ('Comparing','Awarded','Cancelled')),
  awarded_supplier UUID REFERENCES suppliers(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS rfq_quotes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_num     TEXT NOT NULL REFERENCES rfqs(num) ON DELETE CASCADE,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  price       NUMERIC,
  lead_time   TEXT,
  moq         TEXT,
  terms       TEXT,
  warranty    TEXT
);

CREATE TABLE IF NOT EXISTS payments (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_num      TEXT REFERENCES orders(num) ON DELETE SET NULL,
  invoice_total  NUMERIC,
  deposit_pct    NUMERIC,
  deposit_amount NUMERIC,
  deposit_date   DATE,
  balance_due    NUMERIC,
  balance_date   DATE,
  status         TEXT NOT NULL DEFAULT 'Balance Pending' CHECK (status IN ('Balance Pending','Fully Paid','Overdue')),
  notes          TEXT
);

CREATE TABLE IF NOT EXISTS samples (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sample_date    DATE,
  supplier_name  TEXT,
  item_desc      TEXT,
  qty_received   NUMERIC,
  qty_accepted   NUMERIC,
  qty_rejected   NUMERIC,
  notes          TEXT,
  report_received TEXT CHECK (report_received IN ('yes','no'))
);

CREATE INDEX IF NOT EXISTS idx_components_supplier ON components(supplier_id);
CREATE INDEX IF NOT EXISTS idx_orders_supplier ON orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_shipments_supplier ON shipments(supplier_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
