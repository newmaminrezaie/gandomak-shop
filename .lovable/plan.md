# Blog + Internal CMS Plan

A simple Markdown-powered weblog for گندمک‌شاپ with an internal CMS at `/admin/blog`, mirroring the architecture already used for products and orders. Posts live in SQLite on the VPS, are served via the Express API, and rendered as Markdown on the React frontend.

## Backend (server/)

**`server/postsDb.js`** — new SQLite-backed module (better-sqlite3, same DB file as products/orders):
- Table `posts(id, slug UNIQUE, title, cover, excerpt, body_md, tags JSON, status, created_at, updated_at, published_at)`
- CRUD: `listPosts({publishedOnly})`, `getPostBySlug`, `getPostById`, `createPost`, `updatePost`, `deletePost`
- Auto-slug from title (Persian-friendly: keep Unicode letters, replace spaces with `-`, lowercase, ensure unique)

**`server/index.js`** — mount endpoints:
- Public: `GET /api/posts` (published only), `GET /api/posts/:slug`
- Admin (uses existing `requireAdmin` / `ADMIN_TOKEN`):
  - `GET /api/admin/posts`, `POST /api/admin/posts`, `PUT /api/admin/posts/:id`, `DELETE /api/admin/posts/:id`
  - `POST /api/admin/posts/:id/cover` — multer upload to `uploads/posts/:id/` (reuses upload pipeline)

No new env vars. No new Nginx changes (already proxies `/api/` and `/uploads/`).

## Frontend (src/)

**`src/lib/postsStore.ts`** — thin client (mirrors `productsStore.ts`):
- `fetchPosts()`, `fetchPost(slug)`, admin CRUD calls with `x-admin-token` header

**`src/pages/BlogListPage.tsx`** at `/blog`:
- Fetches `/api/posts`, renders cover + title + excerpt + date in a responsive grid
- Loading and empty states in Persian; RTL; SEO title/meta/canonical

**`src/pages/BlogPostPage.tsx`** at `/blog/:slug`:
- Fetches single post, renders Markdown body with `react-markdown` + `remark-gfm`
- Cover image at top, title (H1), date, tags, then content
- Per-post SEO: title, meta description from excerpt, canonical, Open Graph image

**`src/pages/AdminBlogPage.tsx`** at `/admin/blog`:
- Same admin token UX as `AdminOrdersPage` / `AdminProductsPage` (reads `gandomak_admin_token` from localStorage, prompt if missing)
- Left: list of posts (title, status, date, edit/delete)
- Right: editor form
  - Fields: title, slug (auto-filled), excerpt, tags (comma-separated), status (draft/published), cover upload
  - Body: `<textarea>` Markdown editor + live preview pane using `react-markdown`
- "ذخیره پیش‌نویس" / "انتشار" buttons

**`src/App.tsx`** — add three lazy routes: `/blog`, `/blog/:slug`, `/admin/blog`.

## Dependencies

- Backend: none new (better-sqlite3, multer, express already present)
- Frontend: add `react-markdown` and `remark-gfm` (small, no runtime config needed)

## Deploy notes (DEPLOY.md)

- Mention that `/blog` and `/admin/blog` are SPA routes (existing Nginx `try_files` already handles them)
- Posts persist in the same SQLite file as products/orders → existing backups cover them
- Admin token is the same as products/orders — no new secret to manage

## Out of scope (can add later if needed)

- Rich-text WYSIWYG, multiple in-body image uploads, categories/tag filtering pages, comments, RSS feed, footer/header nav link to /blog, "Latest posts" section on home page.
