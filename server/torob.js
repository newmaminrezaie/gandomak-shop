/**
 * Torob API v3 endpoint implementation.
 * Docs: https://panel.torob.com/s/torobApiV3
 *
 * Mounted at POST /torob_api/v3/products by server/index.js.
 * Reads products straight from the SQLite catalog so every change in
 * /admin/products is immediately reflected for Torob (next crawl).
 */
import jwt from "jsonwebtoken";
import db from "./db.js";

const PAGE_SIZE = 100;
const SITE_ORIGIN = (process.env.SITE_ORIGIN || "https://gandomakshop.ir").replace(/\/+$/, "");
const TOROB_PUBLIC_KEY = process.env.TOROB_PUBLIC_KEY || ""; // PEM; if empty, JWT check skipped
const TOROB_ENFORCE_JWT = process.env.TOROB_ENFORCE_JWT === "1";

const listAllStmt = db.prepare(
  `SELECT * FROM products ORDER BY datetime(created_at) DESC, id DESC`
);
const listUpdatedStmt = db.prepare(
  `SELECT * FROM products ORDER BY datetime(updated_at) DESC, id DESC`
);
const bySlugStmt = db.prepare(`SELECT * FROM products WHERE slug = ?`);
const byIdStmt = db.prepare(`SELECT * FROM products WHERE id = ?`);
const countStmt = db.prepare(`SELECT COUNT(*) AS n FROM products`);

function safeJson(s, fb) { try { return JSON.parse(s ?? ""); } catch { return fb; } }

function absUrl(p) {
  if (!p) return "";
  if (/^https?:\/\//i.test(p)) return p;
  if (p.startsWith("/")) return SITE_ORIGIN + p;
  return SITE_ORIGIN + "/" + p;
}

function rowToTorob(r) {
  const images = safeJson(r.images, []).map(absUrl).filter(Boolean);
  const out = {
    page_unique: String(r.id),
    page_url: `${SITE_ORIGIN}/product/${r.slug}`,
    product_group_id: null,
    title: r.name,
    subtitle: null,
    current_price: Math.max(0, Number(r.price) || 0),
    old_price: r.old_price && r.old_price > 0 ? Number(r.old_price) : null,
    availability: !!r.in_stock,
    category_name: r.category || null,
    image_links: images,
    short_desc: r.short_description || null,
    spec: r.weight ? { weight: String(r.weight) } : {},
    guarantee: null,
    date_added: toIso(r.created_at),
    date_updated: toIso(r.updated_at || r.created_at),
  };
  return out;
}

function toIso(s) {
  // Ensure timezone suffix; SQLite values are stored as ISO UTC ("...Z").
  if (!s) return new Date().toISOString();
  if (/[zZ]|[+-]\d{2}:?\d{2}$/.test(s)) return s;
  return new Date(s).toISOString();
}

function verifyToken(req) {
  if (!TOROB_PUBLIC_KEY) {
    if (TOROB_ENFORCE_JWT) throw Object.assign(new Error("public_key_missing"), { code: 500 });
    return; // dev / pre-onboarding mode
  }
  const token = req.headers["x-torob-token"];
  if (!token) throw Object.assign(new Error("missing_token"), { code: 401 });
  try {
    jwt.verify(token, TOROB_PUBLIC_KEY, { algorithms: ["RS256", "ES256"] });
  } catch (e) {
    throw Object.assign(new Error("invalid_token"), { code: 401 });
  }
}

export function torobHandler(req, res) {
  try {
    verifyToken(req);
  } catch (e) {
    return res.status(e.code || 401).json({ error: e.message });
  }

  const body = req.body || {};
  const hasUrls = Array.isArray(body.page_urls);
  const hasUniques = Array.isArray(body.page_uniques);
  const hasList = body.page !== undefined || body.sort !== undefined;

  // Exactly one mode must be provided
  const modes = [hasUrls, hasUniques, hasList].filter(Boolean).length;
  if (modes !== 1) {
    return res.status(400).json({ error: "exactly one of page_urls, page_uniques, or (page+sort) must be provided" });
  }

  // Mode 1: page_urls
  if (hasUrls) {
    if (body.page_urls.length < 1) return res.status(400).json({ error: "page_urls must not be empty" });
    const products = [];
    for (const u of body.page_urls) {
      const slug = String(u || "").split("/product/")[1]?.replace(/\/+$/, "");
      if (!slug) continue;
      const row = bySlugStmt.get(slug);
      if (row) products.push(rowToTorob(row));
    }
    return res.json({
      api_version: "torob_api_v3",
      current_page: 1,
      total: products.length,
      max_pages: 1,
      products,
    });
  }

  // Mode 2: page_uniques
  if (hasUniques) {
    if (body.page_uniques.length < 1) return res.status(400).json({ error: "page_uniques must not be empty" });
    const products = [];
    for (const id of body.page_uniques) {
      const row = byIdStmt.get(String(id));
      if (row) products.push(rowToTorob(row));
    }
    return res.json({
      api_version: "torob_api_v3",
      current_page: 1,
      total: products.length,
      max_pages: 1,
      products,
    });
  }

  // Mode 3: page + sort
  const page = Number(body.page);
  const sort = body.sort;
  if (!Number.isInteger(page) || page < 1) {
    return res.status(400).json({ error: "page must be a positive integer starting from 1" });
  }
  if (sort !== "date_added_desc" && sort !== "date_updated_desc") {
    return res.status(400).json({ error: "sort must be 'date_added_desc' or 'date_updated_desc'" });
  }
  const stmt = sort === "date_updated_desc" ? listUpdatedStmt : listAllStmt;
  const all = stmt.all();
  const total = all.length;
  const max_pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const offset = (page - 1) * PAGE_SIZE;
  const slice = all.slice(offset, offset + PAGE_SIZE);
  return res.json({
    api_version: "torob_api_v3",
    current_page: page,
    total,
    max_pages,
    products: slice.map(rowToTorob),
  });
}
