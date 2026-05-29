/**
 * Product catalog persistence (SQLite). Single source of truth for the live
 * shop. Seeded once from products.seed.js on first boot.
 */
import db from "./db.js";
import { SEED } from "./products.seed.js";

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id                TEXT PRIMARY KEY,
    slug              TEXT NOT NULL UNIQUE,
    name              TEXT NOT NULL,
    category          TEXT NOT NULL,
    weight            TEXT,
    short_description TEXT,
    description       TEXT,
    price             INTEGER NOT NULL DEFAULT 0,
    old_price         INTEGER,
    badge             TEXT,
    in_stock          INTEGER NOT NULL DEFAULT 1,
    highlights        TEXT NOT NULL DEFAULT '[]',
    images            TEXT NOT NULL DEFAULT '[]',
    sort_order        INTEGER NOT NULL DEFAULT 0,
    created_at        TEXT NOT NULL,
    updated_at        TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
  CREATE INDEX IF NOT EXISTS idx_products_cat  ON products(category);
`);

const insertStmt = db.prepare(`
  INSERT INTO products
    (id, slug, name, category, weight, short_description, description,
     price, old_price, badge, in_stock, highlights, images, sort_order,
     created_at, updated_at)
  VALUES
    (@id, @slug, @name, @category, @weight, @short_description, @description,
     @price, @old_price, @badge, @in_stock, @highlights, @images, @sort_order,
     @created_at, @updated_at)
`);

const updateStmt = db.prepare(`
  UPDATE products SET
    slug              = @slug,
    name              = @name,
    category          = @category,
    weight            = @weight,
    short_description = @short_description,
    description       = @description,
    price             = @price,
    old_price         = @old_price,
    badge             = @badge,
    in_stock          = @in_stock,
    highlights        = @highlights,
    images            = @images,
    sort_order        = @sort_order,
    updated_at        = @updated_at
  WHERE id = @id
`);

const deleteStmt   = db.prepare(`DELETE FROM products WHERE id = ?`);
const byIdStmt     = db.prepare(`SELECT * FROM products WHERE id = ?`);
const bySlugStmt   = db.prepare(`SELECT * FROM products WHERE slug = ?`);
const listStmt     = db.prepare(`SELECT * FROM products ORDER BY sort_order ASC, created_at ASC`);
const countStmt    = db.prepare(`SELECT COUNT(*) AS n FROM products`);

function rowToProduct(r) {
  if (!r) return null;
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    category: r.category,
    weight: r.weight ?? "",
    shortDescription: r.short_description ?? "",
    description: r.description ?? "",
    price: r.price,
    oldPrice: r.old_price ?? undefined,
    badge: r.badge ?? undefined,
    inStock: !!r.in_stock,
    highlights: safeJson(r.highlights, []),
    images: safeJson(r.images, []),
    sortOrder: r.sort_order,
  };
}
function safeJson(s, fb) { try { return JSON.parse(s ?? ""); } catch { return fb; } }

function normalizeInput(input, existing = {}) {
  const now = new Date().toISOString();
  const slug = String(input.slug ?? existing.slug ?? "").trim();
  const name = String(input.name ?? existing.name ?? "").trim();
  if (!slug) throw new Error("missing_slug");
  if (!name) throw new Error("missing_name");
  return {
    id: input.id ?? existing.id,
    slug,
    name,
    category: String(input.category ?? existing.category ?? "").trim() || "متفرقه",
    weight: input.weight ?? existing.weight ?? "",
    short_description: input.shortDescription ?? existing.short_description ?? "",
    description: input.description ?? existing.description ?? "",
    price: Math.max(0, Math.floor(Number(input.price ?? existing.price ?? 0)) || 0),
    old_price: input.oldPrice != null ? Math.max(0, Math.floor(Number(input.oldPrice))) : (existing.old_price ?? null),
    badge: input.badge ?? existing.badge ?? null,
    in_stock: (input.inStock ?? (existing.in_stock != null ? !!existing.in_stock : true)) ? 1 : 0,
    highlights: JSON.stringify(Array.isArray(input.highlights) ? input.highlights : safeJson(existing.highlights, [])),
    images: JSON.stringify(Array.isArray(input.images) ? input.images : safeJson(existing.images, [])),
    sort_order: Number(input.sortOrder ?? existing.sort_order ?? 0) || 0,
    created_at: existing.created_at ?? now,
    updated_at: now,
  };
}

function nextId() {
  // Find an unused p-### id
  for (let i = 0; i < 10000; i++) {
    const candidate = `p-${500 + i}`;
    if (!byIdStmt.get(candidate)) return candidate;
  }
  return `p-${Date.now()}`;
}

export function listProducts() {
  return listStmt.all().map(rowToProduct);
}
export function getProductById(id) {
  return rowToProduct(byIdStmt.get(id));
}
export function getProductBySlug(slug) {
  return rowToProduct(bySlugStmt.get(slug));
}

export function createProduct(input) {
  const id = input.id?.trim() || nextId();
  if (byIdStmt.get(id)) throw new Error("id_exists");
  if (bySlugStmt.get(input.slug)) throw new Error("slug_exists");
  const row = normalizeInput({ ...input, id });
  insertStmt.run(row);
  return rowToProduct(byIdStmt.get(id));
}

export function updateProduct(id, input) {
  const existing = byIdStmt.get(id);
  if (!existing) throw new Error("not_found");
  if (input.slug && input.slug !== existing.slug) {
    const clash = bySlugStmt.get(input.slug);
    if (clash && clash.id !== id) throw new Error("slug_exists");
  }
  const row = normalizeInput({ ...input, id }, existing);
  updateStmt.run(row);
  return rowToProduct(byIdStmt.get(id));
}

export function deleteProduct(id) {
  const existing = byIdStmt.get(id);
  if (!existing) return false;
  deleteStmt.run(id);
  return true;
}

export function appendImages(id, paths) {
  const existing = byIdStmt.get(id);
  if (!existing) throw new Error("not_found");
  const current = safeJson(existing.images, []);
  const next = [...current, ...paths];
  return updateProduct(id, { images: next });
}

export function setImages(id, paths) {
  return updateProduct(id, { images: paths });
}

/** One-time seed when the products table is empty. */
export function seedIfEmpty() {
  const n = countStmt.get().n;
  if (n > 0) return 0;
  const now = new Date().toISOString();
  const tx = db.transaction((rows) => {
    rows.forEach((p, i) => {
      insertStmt.run(normalizeInput({ ...p, sortOrder: i }, { created_at: now }));
    });
  });
  tx(SEED);
  console.log(`[products] seeded ${SEED.length} products`);
  return SEED.length;
}
