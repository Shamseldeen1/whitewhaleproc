// Seeds the database with the schema + the same sample data that shipped
// in the original White Whale HTML prototype, plus three starter user
// accounts (admin / user / viewer).
//
// Run with:  npm run db:seed
// Requires DATABASE_URL to be set (see .env.example).

import pg from "pg";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("localhost")
    ? false
    : { rejectUnauthorized: false },
});

async function run() {
  const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  console.log("→ Applying schema...");
  await pool.query(schema);

  console.log("→ Seeding users...");
  const users = [
    { username: "admin", password: "Admin@123", full_name: "Ahmed Amin", role: "admin" },
    { username: "user1", password: "User@123", full_name: "Mona Fathy", role: "user" },
    { username: "viewer1", password: "Viewer@123", full_name: "Sara Nabil", role: "viewer" },
  ];
  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 10);
    await pool.query(
      `INSERT INTO users (username, password_hash, full_name, role)
       VALUES ($1,$2,$3,$4) ON CONFLICT (username) DO NOTHING`,
      [u.username, hash, u.full_name, u.role]
    );
  }

  console.log("→ Seeding suppliers...");
  const suppliers = [
    { code: "SUP-001", name: "Shanghai Kold Components Co.", country: "China", contact: "Li Wei", email: "li.wei@shkold.com", phone: "+86 21 5566 7788", category: "Compressors", rating: 4.5 },
    { code: "SUP-002", name: "EuroBoard Electronics GmbH", country: "Germany", contact: "Hans Müller", email: "h.muller@euroboard.de", phone: "+49 30 1234 5678", category: "Electronics", rating: 4.2 },
    { code: "SUP-003", name: "Nile Plastics", country: "Egypt", contact: "Youssef Adel", email: "youssef@nileplastics.eg", phone: "+20 2 2415 9090", category: "Plastics & Gaskets", rating: 3.8 },
    { code: "SUP-004", name: "Hamburg Steel & Insulation", country: "Germany", contact: "Klaus Richter", email: "k.richter@hsi.de", phone: "+49 40 8877 2200", category: "Insulation", rating: 4.0 },
    { code: "SUP-005", name: "Guangzhou Precision Motors", country: "China", contact: "Zhang Min", email: "zhang.min@gzmotors.cn", phone: "+86 20 3344 5566", category: "Compressors", rating: 4.1 },
  ];
  const supplierIds = {};
  for (const s of suppliers) {
    const r = await pool.query(
      `INSERT INTO suppliers (code,name,country,contact,email,phone,category,rating)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name RETURNING id`,
      [s.code, s.name, s.country, s.contact, s.email, s.phone, s.category, s.rating]
    );
    supplierIds[s.code] = r.rows[0].id;
  }

  console.log("→ Seeding models...");
  const models = [
    { code: "REF-320NF", name: "Refrigerator 320L No-Frost", type: "Refrigerator" },
    { code: "REF-450NF", name: "Refrigerator 450L No-Frost", type: "Refrigerator" },
    { code: "FRZ-200", name: "Freezer 200L Chest", type: "Freezer" },
  ];
  for (const m of models) {
    await pool.query(
      `INSERT INTO models (code,name,type) VALUES ($1,$2,$3)
       ON CONFLICT (code) DO NOTHING`,
      [m.code, m.name, m.type]
    );
  }

  console.log("→ Seeding components...");
  const components = [
    { code: "COMP-101", desc: "Compressor 1/4 HP", supplier: "SUP-001", price: 92, currency: "USD", unit: "Piece", qty: 120 },
    { code: "COMP-102", desc: "PCB Board", supplier: "SUP-002", price: 27, currency: "USD", unit: "Piece", qty: 45 },
    { code: "COMP-103", desc: "Thermostat", supplier: "SUP-002", price: 16, currency: "USD", unit: "Piece", qty: 200 },
    { code: "COMP-104", desc: "Door Gasket REF Upper", supplier: "SUP-003", price: 4.25, currency: "USD", unit: "Piece", qty: 0 },
    { code: "COMP-105", desc: "Thermal Insulation Panel", supplier: "SUP-004", price: 11.5, currency: "USD", unit: "Piece", qty: 60 },
    { code: "COMP-106", desc: "Fan Motor 12V", supplier: "SUP-005", price: 8.75, currency: "USD", unit: "Piece", qty: 90 },
    { code: "COMP-108", desc: "LED Interior Light Kit", supplier: "SUP-002", price: 3.2, currency: "USD", unit: "Piece", qty: 300 },
    { code: "COMP-109", desc: "Compressor 1/5 HP", supplier: "SUP-005", price: 78, currency: "USD", unit: "Piece", qty: 40 },
    { code: "COMP-110", desc: "Freezer Gasket", supplier: "SUP-003", price: 5.1, currency: "USD", unit: "Piece", qty: 0 },
  ];
  const componentIds = {};
  for (const c of components) {
    const r = await pool.query(
      `INSERT INTO components (code,description,supplier_id,price,currency,unit,qty)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (code) DO UPDATE SET description=EXCLUDED.description RETURNING id`,
      [c.code, c.desc, supplierIds[c.supplier], c.price, c.currency, c.unit, c.qty]
    );
    componentIds[c.code] = r.rows[0].id;
  }

  console.log("→ Seeding BOM...");
  const bom = [
    ["REF-320NF", "COMP-101", 1], ["REF-320NF", "COMP-102", 1],
    ["REF-320NF", "COMP-103", 2], ["REF-320NF", "COMP-104", 4],
    ["REF-320NF", "COMP-105", 1], ["REF-320NF", "COMP-106", 1],
    ["REF-450NF", "COMP-109", 1], ["REF-450NF", "COMP-102", 1],
    ["REF-450NF", "COMP-103", 2], ["REF-450NF", "COMP-104", 6],
    ["REF-450NF", "COMP-105", 1], ["REF-450NF", "COMP-108", 1],
    ["FRZ-200", "COMP-109", 1], ["FRZ-200", "COMP-110", 1],
    ["FRZ-200", "COMP-104", 3], ["FRZ-200", "COMP-105", 1],
  ];
  for (const [model, comp, qty] of bom) {
    await pool.query(
      `INSERT INTO bom (model_code, component_id, qty) VALUES ($1,$2,$3)`,
      [model, componentIds[comp], qty]
    );
  }

  console.log("→ Seeding orders...");
  const orders = [
    { num: "PO-2025-001", pi: "PI-2025-001", date: "2025-04-01", supplier: "SUP-001", model: "REF-320NF", currency: "USD", status: "Received", incoterm: "FOB", leadTime: "30 days", items: [{ desc: "Compressor 1/4 HP", qty: 50, unit: "Piece", price: 92 }] },
    { num: "PO-2025-002", pi: "PI-2025-002", date: "2025-04-10", supplier: "SUP-002", model: "REF-450NF", currency: "USD", status: "Approved", incoterm: "CIF", leadTime: "20 days", items: [{ desc: "PCB Board", qty: 30, unit: "Piece", price: 27 }, { desc: "Thermostat", qty: 30, unit: "Piece", price: 16 }] },
    { num: "PO-2025-003", pi: "", date: "2025-04-18", supplier: "SUP-003", model: "FRZ-200", currency: "USD", status: "Pending", incoterm: "FOB", leadTime: "15 days", items: [{ desc: "Freezer Gasket", qty: 100, unit: "Piece", price: 4.25 }] },
    { num: "PO-2025-004", pi: "PI-2025-004", date: "2025-04-20", supplier: "SUP-004", model: "REF-450NF", currency: "USD", status: "Approved", incoterm: "CIF", leadTime: "25 days", items: [{ desc: "Thermal Insulation Panel", qty: 80, unit: "Piece", price: 11.5 }] },
  ];
  for (const o of orders) {
    const r = await pool.query(
      `INSERT INTO orders (num,pi_number,order_date,supplier_id,model_code,currency,status,incoterm,lead_time)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (num) DO UPDATE SET status=EXCLUDED.status RETURNING id`,
      [o.num, o.pi, o.date, supplierIds[o.supplier], o.model, o.currency, o.status, o.incoterm, o.leadTime]
    );
    const orderId = r.rows[0].id;
    for (const it of o.items) {
      await pool.query(
        `INSERT INTO order_items (order_id, desc_text, qty, unit, price) VALUES ($1,$2,$3,$4,$5)`,
        [orderId, it.desc, it.qty, it.unit, it.price]
      );
    }
  }

  console.log("→ Seeding purchase order registry...");
  await pool.query(
    `INSERT INTO purchase_orders (order_num,bl,po_number,division,date_created,creator_name,price,currency)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    ["PO-2025-001", "MAEU1234567890", "PONUM-1001", "Refrigeration", "2025-04-01", "Ahmed Amin", 4600, "USD"]
  );

  console.log("→ Seeding shipments...");
  const shipments = [
    { bl: "MAEU1234567890", acid: "ACID-2025-001", supplier: "SUP-001", order: "PO-2025-001", vessel: "MSC Beatrice", pol: "Shanghai", pod: "Alexandria", incoterms: "FOB", shipDate: "2025-03-15", eta: "2025-04-10", arrival: "2025-04-12", status: "Delivered", remarks: "Delivered on time. All documents cleared." },
    { bl: "HLCU9876543210", acid: "ACID-2025-002", supplier: "SUP-004", order: "PO-2025-004", vessel: "Hapag Lloyd Atlas", pol: "Hamburg", pod: "Alexandria", incoterms: "CIF", shipDate: "2025-04-20", eta: "2025-05-15", arrival: null, status: "In Transit", remarks: "Vessel departed Hamburg on schedule." },
  ];
  for (const s of shipments) {
    await pool.query(
      `INSERT INTO shipments (bl,acid,supplier_id,order_num,vessel,pol,pod,incoterms,ship_date,eta,arrival,status,remarks)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       ON CONFLICT (bl) DO NOTHING`,
      [s.bl, s.acid, supplierIds[s.supplier], s.order, s.vessel, s.pol, s.pod, s.incoterms, s.shipDate, s.eta, s.arrival, s.status, s.remarks]
    );
  }

  console.log("→ Seeding RFQs...");
  await pool.query(
    `INSERT INTO rfqs (num,component,qty,target_price,deadline,status,awarded_supplier)
     VALUES ('RFQ-2025-001','Compressor 1/4 HP',200,88,'2025-05-15','Comparing',NULL)
     ON CONFLICT (num) DO NOTHING`
  );
  await pool.query(
    `INSERT INTO rfqs (num,component,qty,target_price,deadline,status,awarded_supplier)
     VALUES ('RFQ-2025-002','PCB Control Board',300,25,'2025-06-01','Awarded',$1)
     ON CONFLICT (num) DO NOTHING`,
    [supplierIds["SUP-002"]]
  );
  const rfqQuotes = [
    { rfq: "RFQ-2025-001", supplier: "SUP-001", price: 92, leadTime: "30 days", moq: "50", terms: "30% / 70%", warranty: "2 years" },
    { rfq: "RFQ-2025-001", supplier: "SUP-005", price: 95, leadTime: "25 days", moq: "100", terms: "50% / 50%", warranty: "1 year" },
    { rfq: "RFQ-2025-002", supplier: "SUP-002", price: 27, leadTime: "20 days", moq: "50", terms: "30% / 70%", warranty: "1 year" },
  ];
  for (const q of rfqQuotes) {
    await pool.query(
      `INSERT INTO rfq_quotes (rfq_num,supplier_id,price,lead_time,moq,terms,warranty)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [q.rfq, supplierIds[q.supplier], q.price, q.leadTime, q.moq, q.terms, q.warranty]
    );
  }

  console.log("→ Seeding payments...");
  await pool.query(
    `INSERT INTO payments (order_num,invoice_total,deposit_pct,deposit_amount,deposit_date,balance_due,balance_date,status)
     VALUES ('PO-2025-001',4600,30,1380,'2025-04-02',3220,'2025-04-25','Fully Paid')`
  );
  await pool.query(
    `INSERT INTO payments (order_num,invoice_total,deposit_pct,deposit_amount,deposit_date,balance_due,balance_date,status)
     VALUES ('PO-2025-002',1290,30,387,'2025-04-11',903,'2025-05-10','Balance Pending')`
  );

  console.log("→ Seeding samples...");
  await pool.query(
    `INSERT INTO samples (sample_date,supplier_name,item_desc,qty_received,qty_accepted,qty_rejected,notes,report_received)
     VALUES ('2025-04-08','Nile Plastics','Door Gasket REF Upper – new formulation sample',10,8,2,'2 units showed seam separation under cold test.','yes')`
  );
  await pool.query(
    `INSERT INTO samples (sample_date,supplier_name,item_desc,qty_received,qty_accepted,qty_rejected,notes,report_received)
     VALUES ('2025-04-15','New Trial Supplier Ltd.','Compressor 1/5 HP – trial sample',3,0,0,'Awaiting Quality team inspection.','no')`
  );

  console.log("✓ Seed complete.");
  console.log("  Login with: admin / Admin@123  (change this immediately after first login)");
  await pool.end();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
