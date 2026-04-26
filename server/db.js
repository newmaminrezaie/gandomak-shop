/**
 * SQLite layer for گندمک shop orders.
 * Uses better-sqlite3 (synchronous, fast, zero-config).
 */
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "orders.db");
const LEGACY_JSON = path.join(__dirname, "orders.json");

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id                 TEXT PRIMARY KEY,
    customer_name      TEXT NOT NULL,
    customer_phone     TEXT NOT NULL,
    customer_address   TEXT NOT NULL,
    customer_postalcode TEXT,
    items              TEXT NOT NULL,           -- JSON [{id,name,qty,price}]
    total_toman        INTEGER NOT NULL,
    total_rial         INTEGER NOT NULL,
    payment_method     TEXT NOT NULL,           -- 'zibal' | 'card'
    track_id           TEXT,                    -- Zibal trackId
    ref_number         TEXT,                    -- Zibal refNumber after verify
    card_number        TEXT,                    -- destination card (card-to-card)
    card_ref           TEXT,                    -- user-supplied transfer ref
    paid_at            TEXT,
    status             TEXT NOT NULL,           -- pending | paid | failed | awaiting_review
    created_at         TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_orders_track ON orders(track_id);
  CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
`);

// One-time migration from orders.json (if present and not yet migrated)
try {
  if (fs.existsSync(LEGACY_JSON)) {
    const raw = fs.readFileSync(LEGACY_JSON, "utf8").trim();
    if (raw && raw !== "[]") {
      const arr = JSON.parse(raw);
      const insert = db.prepare(`
        INSERT OR IGNORE INTO orders
        (id, customer_name, customer_phone, customer_address, customer_postalcode,
         items, total_toman, total_rial, payment_method, track_id, ref_number,
         card_number, card_ref, paid_at, status, created_at)
        VALUES (@id, @customer_name, @customer_phone, @customer_address, @customer_postalcode,
                @items, @total_toman, @total_rial, @payment_method, @track_id, @ref_number,
                @card_number, @card_ref, @paid_at, @status, @created_at)
      `);
      const tx = db.transaction((rows) => {
        for (const o of rows) {
          insert.run({
            id: o.id,
            customer_name: o.customer?.name ?? "",
            customer_phone: o.customer?.phone ?? "",
            customer_address: o.customer?.address ?? "",
            customer_postalcode: o.customer?.postalCode ?? "",
            items: JSON.stringify(o.lines ?? []),
            total_toman: o.total ?? 0,
            total_rial: o.amountRial ?? (o.total ?? 0) * 10,
            payment_method: o.paymentMethod ?? "zibal",
            track_id: o.authority ?? o.trackId ?? null,
            ref_number: o.refId ?? null,
            card_number: o.cardNumber ?? null,
            card_ref: o.cardRef ?? null,
            paid_at: o.paidAt ?? null,
            status: o.status ?? "pending",
            created_at: o.createdAt ?? new Date().toISOString(),
          });
        }
      });
      tx(arr);
      console.log(`[db] migrated ${arr.length} legacy orders from orders.json`);
    }
    fs.renameSync(LEGACY_JSON, LEGACY_JSON + ".bak");
  }
} catch (e) {
  console.error("[db] legacy migration failed:", e);
}

const insertStmt = db.prepare(`
  INSERT INTO orders
  (id, customer_name, customer_phone, customer_address, customer_postalcode,
   items, total_toman, total_rial, payment_method, track_id, ref_number,
   card_number, card_ref, paid_at, status, created_at)
  VALUES (@id, @customer_name, @customer_phone, @customer_address, @customer_postalcode,
          @items, @total_toman, @total_rial, @payment_method, @track_id, @ref_number,
          @card_number, @card_ref, @paid_at, @status, @created_at)
`);

const updateStatusStmt = db.prepare(`
  UPDATE orders
     SET status = @status,
         ref_number = COALESCE(@ref_number, ref_number),
         paid_at = COALESCE(@paid_at, paid_at)
   WHERE id = @id
`);

const byTrackStmt = db.prepare(`SELECT * FROM orders WHERE track_id = ?`);
const byIdStmt = db.prepare(`SELECT * FROM orders WHERE id = ?`);
const listStmt = db.prepare(`SELECT * FROM orders ORDER BY created_at DESC LIMIT 500`);

function rowToOrder(row) {
  if (!row) return null;
  return {
    ...row,
    items: safeJson(row.items),
  };
}
function safeJson(s) {
  try { return JSON.parse(s ?? "[]"); } catch { return []; }
}

export function insertOrder(order) {
  insertStmt.run({
    ref_number: null,
    track_id: null,
    card_number: null,
    card_ref: null,
    paid_at: null,
    customer_postalcode: "",
    ...order,
    items: typeof order.items === "string" ? order.items : JSON.stringify(order.items ?? []),
  });
  return rowToOrder(byIdStmt.get(order.id));
}

export function updateOrderStatus({ id, status, ref_number = null, paid_at = null }) {
  updateStatusStmt.run({ id, status, ref_number, paid_at });
  return rowToOrder(byIdStmt.get(id));
}

export function getOrderByTrackId(trackId) {
  return rowToOrder(byTrackStmt.get(String(trackId)));
}

export function getOrderById(id) {
  return rowToOrder(byIdStmt.get(id));
}

export function listOrders() {
  return listStmt.all().map(rowToOrder);
}

export default db;
