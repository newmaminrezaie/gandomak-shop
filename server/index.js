/**
 * گندمک شاپ — Express + Zibal backend
 * --------------------------------------
 * Run on the same VPS that serves the built React app (dist/).
 * Nginx reverse-proxies /api/*, /uploads/*  AND  /payment/callback  to this Node process.
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
import multer from "multer";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import {
  insertOrder,
  updateOrderStatus,
  getOrderByTrackId,
  listOrders,
} from "./db.js";
import {
  listProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  appendImages,
  setImages,
  seedIfEmpty,
} from "./productsDb.js";
import {
  listPosts,
  getPostBySlug,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  setPostCover,
} from "./postsDb.js";
import { notifyPaidOrder } from "./telegram.js";
import { notifyPaidOrderRubika, notifyCardOrderRubika } from "./rubika.js";
import { torobHandler } from "./torob.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

const SUCCESS_PATH = "/payment/success";
const FAILED_PATH = "/payment/failed";

function siteOrigin() {
  try { return new URL(CALLBACK_URL).origin; } catch { return ""; }
}

// ── Boot: seed products if first run ─────────────────────────────────────────
seedIfEmpty();

// ── Uploads dir ──────────────────────────────────────────────────────────────
const UPLOADS_ROOT = path.join(__dirname, "uploads");
fs.mkdirSync(path.join(UPLOADS_ROOT, "products"), { recursive: true });

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
function makeUpload(subdir) {
  return multer({
    storage: multer.diskStorage({
      destination: (req, _file, cb) => {
        const pid = String(req.params.id || "misc").replace(/[^a-z0-9_-]/gi, "");
        const dir = path.join(UPLOADS_ROOT, subdir, pid);
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
      },
      filename: (_req, file, cb) => {
        const ext = (path.extname(file.originalname) || ".jpg").toLowerCase().slice(0, 5);
        const safeExt = /^\.(jpg|jpeg|png|webp|gif)$/.test(ext) ? ext : ".jpg";
        cb(null, `${Date.now()}-${crypto.randomBytes(4).toString("hex")}${safeExt}`);
      },
    }),
    limits: { fileSize: 5 * 1024 * 1024, files: 10 },
    fileFilter: (_req, file, cb) => {
      if (!ALLOWED_MIME.has(file.mimetype)) return cb(new Error("unsupported_type"));
      cb(null, true);
    },
  });
}

const upload = makeUpload("products");
const postUpload = makeUpload("posts");

fs.mkdirSync(path.join(UPLOADS_ROOT, "posts"), { recursive: true });

const app = express();
app.use(cors());
app.use(express.json({ limit: "200kb" }));

// Serve uploaded images. In production, nginx should proxy /uploads/* here.
app.use("/uploads", express.static(UPLOADS_ROOT, {
  maxAge: "7d",
  setHeaders: (res) => res.setHeader("Cache-Control", "public, max-age=604800"),
}));

// ── Admin auth middleware ───────────────────────────────────────────────────
function requireAdmin(req, res, next) {
  if (req.headers["x-admin-token"] !== ADMIN_TOKEN) return res.status(401).json({ error: "unauthorized" });
  next();
}

app.get("/api/health", (_req, res) =>
  res.json({ ok: true, merchant: MERCHANT_ID === "zibal" ? "sandbox" : "live" })
);

app.get("/api/payment/card", (_req, res) => {
  res.json({ number: CARD_NUMBER, holder: CARD_HOLDER });
});

// ── Public product endpoints ────────────────────────────────────────────────
app.get("/api/products", (_req, res) => {
  res.json(listProducts());
});
app.get("/api/products/:slug", (req, res) => {
  const p = getProductBySlug(req.params.slug);
  if (!p) return res.status(404).json({ error: "not_found" });
  res.json(p);
});

// ── Torob API v3 (https://panel.torob.com/s/torobApiV3) ─────────────────────
app.post("/torob_api/v3/products", torobHandler);



// ── Admin product endpoints ─────────────────────────────────────────────────
app.get("/api/admin/products", requireAdmin, (_req, res) => {
  res.json(listProducts());
});

app.post("/api/admin/products", requireAdmin, (req, res) => {
  try {
    const created = createProduct(req.body || {});
    res.json(created);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.put("/api/admin/products/:id", requireAdmin, (req, res) => {
  try {
    const updated = updateProduct(req.params.id, req.body || {});
    res.json(updated);
  } catch (e) {
    const code = e.message === "not_found" ? 404 : 400;
    res.status(code).json({ error: e.message });
  }
});

app.delete("/api/admin/products/:id", requireAdmin, (req, res) => {
  const ok = deleteProduct(req.params.id);
  if (!ok) return res.status(404).json({ error: "not_found" });
  res.json({ ok: true });
});

// Upload one or more images for a product. Appends to images[] (cover = index 0).
app.post(
  "/api/admin/products/:id/images",
  requireAdmin,
  (req, res, next) => {
    // multer needs the id param resolved; ensure product exists first.
    if (!getProductById(req.params.id)) return res.status(404).json({ error: "not_found" });
    next();
  },
  upload.array("files", 10),
  (req, res) => {
    try {
      const id = req.params.id;
      const paths = (req.files || []).map(
        (f) => `/uploads/products/${id}/${path.basename(f.path)}`
      );
      if (!paths.length) return res.status(400).json({ error: "no_files" });
      const updated = appendImages(id, paths);
      res.json(updated);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  }
);

// Replace the entire images array (used for reorder + delete).
app.put("/api/admin/products/:id/images", requireAdmin, (req, res) => {
  try {
    const images = Array.isArray(req.body?.images) ? req.body.images : null;
    if (!images) return res.status(400).json({ error: "missing_images" });
    const product = getProductById(req.params.id);
    if (!product) return res.status(404).json({ error: "not_found" });
    // Best-effort delete of removed uploaded files
    const removed = product.images.filter((p) => !images.includes(p));
    for (const rel of removed) {
      if (rel.startsWith("/uploads/")) {
        const abs = path.join(__dirname, rel);
        fs.unlink(abs, () => {});
      }
    }
    const updated = setImages(req.params.id, images);
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// ── Orders ──────────────────────────────────────────────────────────────────
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

    // Server-side total (never trust client) — read prices from DB.
    let total = 0;
    const lines = [];
    for (const it of items) {
      const p = getProductById(it.id);
      if (!p) continue;
      if (p.price <= 0) continue; // contact-for-price items skipped
      const qty = Math.max(1, Math.min(99, Number(it.qty) || 1));
      total += p.price * qty;
      lines.push({ id: p.id, name: it.name || p.name || p.id, qty, price: p.price });
    }
    if (total <= 0) return res.status(400).json({ error: "no_billable_items" });

    const subtotal = total;
    total = subtotal + PACKAGING_FEE;
    const totalRial = total * 10;
    const orderId = `ord_${Date.now()}`;
    const now = new Date().toISOString();

    if (paymentMethod === "card") {
      if (!cardRef || String(cardRef).trim().length < 4) {
        return res.status(400).json({ error: "missing_card_ref" });
      }
      const refId = `C${Date.now().toString().slice(-6)}`;
      const cardOrder = {
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
      };
      insertOrder(cardOrder);
      notifyCardOrderRubika(cardOrder).catch((e) =>
        console.error("[rubika] notify failed:", e)
      );
      return res.json({ ok: true, orderId, refId });
    }

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

app.get("/payment/callback", async (req, res) => {
  const origin = siteOrigin();
  const trackId = String(req.query.trackId ?? "");
  const success = String(req.query.success ?? "");

  if (!trackId) return res.redirect(302, `${origin}${FAILED_PATH}?reason=no_track`);

  const order = getOrderByTrackId(trackId);
  if (!order) return res.redirect(302, `${origin}${FAILED_PATH}?reason=not_found&trackId=${trackId}`);

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
    if (vJson?.result === 100 || vJson?.result === 201) {
      const refNumber = vJson?.refNumber ? String(vJson.refNumber) : trackId;
      const updated = updateOrderStatus({
        id: order.id,
        status: "paid",
        ref_number: refNumber,
        paid_at: new Date().toISOString(),
      });
      notifyPaidOrder(updated).catch((e) => console.error("[telegram] notify failed:", e));
      notifyPaidOrderRubika(updated).catch((e) => console.error("[rubika] notify failed:", e));
      return res.redirect(
        302,
        `${origin}${SUCCESS_PATH}?trackId=${trackId}&refId=${encodeURIComponent(refNumber)}`
      );
    }
    console.error("[zibal] verify failed:", vJson);
    updateOrderStatus({ id: order.id, status: "failed" });
    return res.redirect(302, `${origin}${FAILED_PATH}?trackId=${trackId}&result=${vJson?.result ?? "?"}`);
  } catch (err) {
    console.error("[callback] error:", err);
    updateOrderStatus({ id: order.id, status: "failed" });
    return res.redirect(302, `${origin}${FAILED_PATH}?trackId=${trackId}&reason=server_error`);
  }
});

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
