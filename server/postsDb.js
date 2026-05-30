/**
 * Blog posts persistence (SQLite). Shares the same DB file as products/orders.
 */
import db from "./db.js";

db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id           TEXT PRIMARY KEY,
    slug         TEXT NOT NULL UNIQUE,
    title        TEXT NOT NULL,
    cover        TEXT,
    excerpt      TEXT,
    body_md      TEXT NOT NULL DEFAULT '',
    tags         TEXT NOT NULL DEFAULT '[]',
    status       TEXT NOT NULL DEFAULT 'draft',
    created_at   TEXT NOT NULL,
    updated_at   TEXT NOT NULL,
    published_at TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_posts_slug   ON posts(slug);
  CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
`);

const insertStmt = db.prepare(`
  INSERT INTO posts (id, slug, title, cover, excerpt, body_md, tags, status,
                     created_at, updated_at, published_at)
  VALUES (@id, @slug, @title, @cover, @excerpt, @body_md, @tags, @status,
          @created_at, @updated_at, @published_at)
`);

const updateStmt = db.prepare(`
  UPDATE posts SET
    slug         = @slug,
    title        = @title,
    cover        = @cover,
    excerpt      = @excerpt,
    body_md      = @body_md,
    tags         = @tags,
    status       = @status,
    updated_at   = @updated_at,
    published_at = @published_at
  WHERE id = @id
`);

const byIdStmt        = db.prepare(`SELECT * FROM posts WHERE id = ?`);
const bySlugStmt      = db.prepare(`SELECT * FROM posts WHERE slug = ?`);
const deleteStmt      = db.prepare(`DELETE FROM posts WHERE id = ?`);
const listAllStmt     = db.prepare(`SELECT * FROM posts ORDER BY COALESCE(published_at, created_at) DESC`);
const listPubStmt     = db.prepare(`SELECT * FROM posts WHERE status = 'published' ORDER BY COALESCE(published_at, created_at) DESC`);

function safeJson(s, fb) { try { return JSON.parse(s ?? ""); } catch { return fb; } }

function rowToPost(r) {
  if (!r) return null;
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    cover: r.cover ?? "",
    excerpt: r.excerpt ?? "",
    body: r.body_md ?? "",
    tags: safeJson(r.tags, []),
    status: r.status,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    publishedAt: r.published_at ?? null,
  };
}

/** Persian-friendly slugifier: keeps Unicode letters/digits, dashes spaces. */
function slugify(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function uniqueSlug(base, ignoreId = null) {
  let s = base || `post-${Date.now()}`;
  let i = 1;
  while (true) {
    const existing = bySlugStmt.get(s);
    if (!existing || existing.id === ignoreId) return s;
    i += 1;
    s = `${base}-${i}`;
  }
}

function nextId() {
  return `post_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

function normalize(input, existing = {}) {
  const now = new Date().toISOString();
  const title = String(input.title ?? existing.title ?? "").trim();
  if (!title) throw new Error("missing_title");
  const baseSlug =
    slugify(input.slug ?? existing.slug ?? title) || `post-${Date.now()}`;
  const slug = uniqueSlug(baseSlug, existing.id ?? null);
  const status = input.status === "published" ? "published" : "draft";
  const prevPublished = existing.published_at ?? null;
  const publishedAt =
    status === "published" ? (prevPublished ?? now) : null;

  return {
    id: input.id ?? existing.id,
    slug,
    title,
    cover: (input.cover ?? existing.cover ?? "") || null,
    excerpt: String(input.excerpt ?? existing.excerpt ?? "").trim(),
    body_md: String(input.body ?? input.body_md ?? existing.body_md ?? ""),
    tags: JSON.stringify(
      Array.isArray(input.tags)
        ? input.tags.map((t) => String(t).trim()).filter(Boolean)
        : safeJson(existing.tags, [])
    ),
    status,
    created_at: existing.created_at ?? now,
    updated_at: now,
    published_at: publishedAt,
  };
}

export function listPosts({ publishedOnly = false } = {}) {
  const rows = publishedOnly ? listPubStmt.all() : listAllStmt.all();
  return rows.map(rowToPost);
}
export function getPostById(id)     { return rowToPost(byIdStmt.get(id)); }
export function getPostBySlug(slug) { return rowToPost(bySlugStmt.get(slug)); }

export function createPost(input) {
  const id = nextId();
  const row = normalize({ ...input, id });
  insertStmt.run(row);
  return rowToPost(byIdStmt.get(id));
}

export function updatePost(id, input) {
  const existing = byIdStmt.get(id);
  if (!existing) throw new Error("not_found");
  const row = normalize({ ...input, id }, existing);
  updateStmt.run(row);
  return rowToPost(byIdStmt.get(id));
}

export function deletePost(id) {
  if (!byIdStmt.get(id)) return false;
  deleteStmt.run(id);
  return true;
}

export function setPostCover(id, coverPath) {
  return updatePost(id, { cover: coverPath });
}
