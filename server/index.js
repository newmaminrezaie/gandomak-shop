/**
 * گندمک شاپ — Express + Zarinpal backend
 * --------------------------------------
 * Run on the same VPS that serves the built React app (dist/).
 * Nginx reverse-proxies /api/* to this Node process (default :8787).
 *
 * Quick start (on your VPS):
 *   cd server
 *   npm init -y
 *   npm i express cors
 *   cp .env.example .env   # then fill in ZARINPAL_MERCHANT_ID + CALLBACK_URL
 *   node index.js          # or: pm2 start index.js --name gandomak-api
 *
 * Endpoints:
 *   POST /api/order      → { paymentUrl }     starts Zarinpal payment
 *   POST /api/verify     → { ok, refId }       verifies after callback
 *   GET  /api/orders     → admin (header: x-admin-token)
 */

import express from "express";
import cors from "cors";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PRODUCTS } from "./products.mirror.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = process.env.PORT || 8787;
const MERCHANT_ID = process.env.ZARINPAL_MERCHANT_ID || "00000000-0000-0000-0000-000000000000";
const CALLBACK_URL = process.env.CALLBACK_URL || "https://gandomakshop.ir/payment/callback";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "change-me";
const SANDBOX = String(process.env.ZARINPAL_SANDBOX || "false") === "true";

const ZP_BASE = SANDBOX ? "https://sandbox.zarinpal.com" : "https://payment.zarinpal.com";
const ZP_REQUEST = `${ZP_BASE}/pg/v4/payment/request.json`;
const ZP_VERIFY = `${ZP_BASE}/pg/v4/payment/verify.json`;
const ZP_GATEWAY = (authority) => `${ZP_BASE}/pg/StartPay/${authority}`;

const ORDERS_FILE = path.join(__dirname, "orders.json");

async function readOrders() {
  try {
    const raw = await fs.readFile(ORDERS_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
async function writeOrders(arr) {
  await fs.writeFile(ORDERS_FILE, JSON.stringify(arr, null, 2), "utf8");
}

const app = express();
app.use(cors());
app.use(express.json({ limit: "200kb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true, sandbox: SANDBOX }));

app.post("/api/order", async (req, res) => {
  try {
    const { customer, items } = req.body || {};
    if (!customer?.name || !customer?.phone || !customer?.address) {
      return res.status(400).json({ error: "missing_customer" });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "empty_cart" });
    }

    // Server-side total (never trust client)
    let total = 0;
    const lines = [];
    for (const it of items) {
      const p = PRODUCTS.find((x) => x.id === it.id);
      if (!p) continue;
      if (p.price <= 0) continue; // contact-for-price items skipped
      const qty = Math.max(1, Math.min(99, Number(it.qty) || 1));
      total += p.price * qty;
      lines.push({ id: p.id, name: p.name, qty, price: p.price });
    }
    if (total <= 0) return res.status(400).json({ error: "no_billable_items" });

    // Zarinpal expects amount in IRR; if your prices are in Toman, convert ×10.
    // Our products store prices in TOMAN (per the spec), so convert here.
    const amountRial = total * 10;

    const zpRes = await fetch(ZP_REQUEST, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchant_id: MERCHANT_ID,
        amount: amountRial,
        currency: "IRR",
        description: `سفارش گندمک شاپ - ${customer.name}`,
        callback_url: CALLBACK_URL,
        metadata: { mobile: customer.phone, name: customer.name },
      }),
    });
    const zpJson = await zpRes.json();

    if (zpJson?.data?.code !== 100 || !zpJson?.data?.authority) {
      return res.status(502).json({ error: "zarinpal_request_failed", detail: zpJson });
    }
    const authority = zpJson.data.authority;

    const orders = await readOrders();
    orders.push({
      id: `ord_${Date.now()}`,
      authority,
      status: "pending",
      total,
      amountRial,
      lines,
      customer,
      createdAt: new Date().toISOString(),
    });
    await writeOrders(orders);

    return res.json({ paymentUrl: ZP_GATEWAY(authority) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

app.post("/api/verify", async (req, res) => {
  try {
    const { authority } = req.body || {};
    if (!authority) return res.status(400).json({ ok: false, error: "missing_authority" });

    const orders = await readOrders();
    const order = orders.find((o) => o.authority === authority);
    if (!order) return res.status(404).json({ ok: false, error: "order_not_found" });

    const zpRes = await fetch(ZP_VERIFY, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchant_id: MERCHANT_ID,
        amount: order.amountRial,
        authority,
      }),
    });
    const zpJson = await zpRes.json();

    if (zpJson?.data?.code === 100 || zpJson?.data?.code === 101) {
      order.status = "paid";
      order.refId = String(zpJson.data.ref_id);
      order.paidAt = new Date().toISOString();
      await writeOrders(orders);
      return res.json({ ok: true, refId: order.refId });
    }
    order.status = "failed";
    await writeOrders(orders);
    return res.json({ ok: false });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: "server_error" });
  }
});

app.get("/api/orders", async (req, res) => {
  if (req.headers["x-admin-token"] !== ADMIN_TOKEN) return res.status(401).end();
  res.json(await readOrders());
});

app.listen(PORT, () => {
  console.log(`گندمک API → http://localhost:${PORT} (sandbox=${SANDBOX})`);
});
