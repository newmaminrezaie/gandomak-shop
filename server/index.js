/**
 * گندمک شاپ — Express + Zibal backend
 * --------------------------------------
 * Run on the same VPS that serves the built React app (dist/).
 * Nginx reverse-proxies /api/*  AND  /payment/callback  to this Node process.
 *
 * Quick start:
 *   cd server
 *   npm install
 *   cp .env.example .env   # then fill in ZIBAL_MERCHANT_ID + TELEGRAM_*
 *   node index.js          # or: pm2 start index.js --name gandomak-api
 */

import "dotenv/config";
import express from "express";
import cors from "cors";
import { PRODUCTS } from "./products.mirror.js";
import {
  insertOrder,
  updateOrderStatus,
  getOrderByTrackId,
  listOrders,
} from "./db.js";
import { notifyPaidOrder } from "./telegram.js";

const PORT = process.env.PORT || 3001;
const MERCHANT_ID = process.env.ZIBAL_MERCHANT_ID || "zibal"; // 'zibal' = sandbox
const CALLBACK_URL = process.env.CALLBACK_URL || "https://gandomakshop.ir/payment/callback";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "change-me";

const CARD_NUMBER = process.env.CARD_NUMBER || "6063731055805767";
const CARD_HOLDER = process.env.CARD_HOLDER || "یاسر شمسی";

const PACKAGING_FEE = 30000; // toman — flat per-order packaging fee
const ALLOWED_SHIPPING = new Set(["post_cod"]);

const ZIBAL_REQUEST = "https://gateway.zibal.ir/v1/request";
const ZIBAL_VERIFY = "https://gateway.zibal.ir/v1/verify";
const ZIBAL_START = (trackId) => `https://gateway.zibal.ir/start/${trackId}`;

// Where the SPA's success / failure pages live (relative to site root)
const SUCCESS_PATH = "/payment/success";
const FAILED_PATH = "/payment/failed";

// Derive the site origin from CALLBACK_URL so we can redirect back to the SPA
function siteOrigin() {
  try {
    return new URL(CALLBACK_URL).origin;
  } catch {
    return "";
  }
}

const app = express();
app.use(cors());
app.use(express.json({ limit: "200kb" }));

app.get("/api/health", (_req, res) =>
  res.json({ ok: true, merchant: MERCHANT_ID === "zibal" ? "sandbox" : "live" })
);

app.get("/api/payment/card", (_req, res) => {
  res.json({ number: CARD_NUMBER, holder: CARD_HOLDER });
});

app.post("/api/order", async (req, res) => {
  try {
    const { customer, items, paymentMethod = "zibal", shippingMethod, cardRef, paidAt } = req.body || {};
    const shipping = ALLOWED_SHIPPING.has(shippingMethod) ? shippingMethod : "post_cod";
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
      lines.push({
        id: p.id,
        // The mirror only has id+price; use the id as a fallback name
        // (frontend cart already shows the rich data — this is just for ops/Telegram).
        name: it.name || p.id,
        qty,
        price: p.price,
      });
    }
    if (total <= 0) return res.status(400).json({ error: "no_billable_items" });

    const subtotal = total;
    total = subtotal + PACKAGING_FEE;
    const totalRial = total * 10; // products are in TOMAN
    const orderId = `ord_${Date.now()}`;
    const now = new Date().toISOString();

    // ── Card-to-card branch ────────────────────────────────────────────
    if (paymentMethod === "card") {
      if (!cardRef || String(cardRef).trim().length < 4) {
        return res.status(400).json({ error: "missing_card_ref" });
      }
      const refId = `C${Date.now().toString().slice(-6)}`;
      insertOrder({
        id: orderId,
        customer_name: customer.name,
        customer_phone: customer.phone,
        customer_address: customer.address,
        customer_postalcode: customer.postalCode ?? "",
        items: lines,
        subtotal_toman: subtotal,
        packaging_fee: PACKAGING_FEE,
        shipping_method: shipping,
        total_toman: total,
        total_rial: totalRial,
        payment_method: "card",
        track_id: null,
        ref_number: refId,
        card_number: CARD_NUMBER,
        card_ref: String(cardRef).trim(),
        paid_at: paidAt ? String(paidAt).trim() : null,
        status: "awaiting_review",
        created_at: now,
      });
      return res.json({ ok: true, orderId, refId });
    }

    // ── Zibal branch ───────────────────────────────────────────────────
    if (paymentMethod !== "zibal") {
      return res.status(400).json({ error: "unknown_payment_method" });
    }

    const zRes = await fetch(ZIBAL_REQUEST, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchant: MERCHANT_ID,
        amount: totalRial,
        callbackUrl: CALLBACK_URL,
        description: `سفارش گندمک شاپ - ${customer.name}`,
        mobile: customer.phone,
        orderId,
      }),
    });
    const zJson = await zRes.json().catch(() => ({}));
    if (zJson?.result !== 100 || !zJson?.trackId) {
      console.error("[zibal] request failed:", zJson);
      return res.status(502).json({
        error: "zibal_request_failed",
        result: zJson?.result,
        message: zJson?.message,
      });
    }
    const trackId = String(zJson.trackId);

    insertOrder({
      id: orderId,
      customer_name: customer.name,
      customer_phone: customer.phone,
      customer_address: customer.address,
      customer_postalcode: customer.postalCode ?? "",
      items: lines,
      subtotal_toman: subtotal,
      packaging_fee: PACKAGING_FEE,
      shipping_method: shipping,
      total_toman: total,
      total_rial: totalRial,
      payment_method: "zibal",
      track_id: trackId,
      status: "pending",
      created_at: now,
    });

    return res.json({ paymentUrl: ZIBAL_START(trackId), trackId, orderId });
  } catch (err) {
    console.error("[order] error:", err);
    return res.status(500).json({ error: "server_error" });
  }
});

// Zibal redirects the buyer's browser here as a GET.
app.get("/payment/callback", async (req, res) => {
  const origin = siteOrigin();
  const trackId = String(req.query.trackId ?? "");
  const success = String(req.query.success ?? "");

  if (!trackId) {
    return res.redirect(302, `${origin}${FAILED_PATH}?reason=no_track`);
  }

  const order = getOrderByTrackId(trackId);
  if (!order) {
    return res.redirect(302, `${origin}${FAILED_PATH}?reason=not_found&trackId=${trackId}`);
  }

  if (success !== "1") {
    updateOrderStatus({ id: order.id, status: "failed" });
    return res.redirect(302, `${origin}${FAILED_PATH}?trackId=${trackId}`);
  }

  try {
    const vRes = await fetch(ZIBAL_VERIFY, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ merchant: MERCHANT_ID, trackId: Number(trackId) }),
    });
    const vJson = await vRes.json().catch(() => ({}));
    // 100 = verified now, 201 = already verified previously
    if (vJson?.result === 100 || vJson?.result === 201) {
      const refNumber = vJson?.refNumber ? String(vJson.refNumber) : trackId;
      const updated = updateOrderStatus({
        id: order.id,
        status: "paid",
        ref_number: refNumber,
        paid_at: new Date().toISOString(),
      });
      // Fire-and-forget Telegram notification
      notifyPaidOrder(updated).catch((e) =>
        console.error("[telegram] notify failed:", e)
      );
      return res.redirect(
        302,
        `${origin}${SUCCESS_PATH}?trackId=${trackId}&refId=${encodeURIComponent(refNumber)}`
      );
    }

    console.error("[zibal] verify failed:", vJson);
    updateOrderStatus({ id: order.id, status: "failed" });
    return res.redirect(
      302,
      `${origin}${FAILED_PATH}?trackId=${trackId}&result=${vJson?.result ?? "?"}`
    );
  } catch (err) {
    console.error("[callback] error:", err);
    updateOrderStatus({ id: order.id, status: "failed" });
    return res.redirect(302, `${origin}${FAILED_PATH}?trackId=${trackId}&reason=server_error`);
  }
});

// Lightweight status lookup for the SPA success page
app.get("/api/order/status", (req, res) => {
  const trackId = String(req.query.trackId ?? "");
  if (!trackId) return res.status(400).json({ error: "missing_trackId" });
  const order = getOrderByTrackId(trackId);
  if (!order) return res.status(404).json({ error: "not_found" });
  return res.json({
    id: order.id,
    status: order.status,
    refId: order.ref_number,
    total: order.total_toman,
  });
});

app.get("/api/orders", (req, res) => {
  if (req.headers["x-admin-token"] !== ADMIN_TOKEN) return res.status(401).end();
  res.json(listOrders());
});

app.listen(PORT, () => {
  console.log(
    `گندمک API → http://localhost:${PORT} (merchant=${MERCHANT_ID === "zibal" ? "sandbox" : "live"})`
  );
});
