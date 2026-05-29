# Internal Product CMS Plan

Goal: a tiny admin at `gandomakshop.ir/admin/products` to add/edit/delete products and manage their images. Changes appear instantly on the live shop without `npm run build`. Works 100% offline on the VPS. Reuses the existing admin token from `/admin/orders`.

## How it works (high level)

- Products move from the static `src/data/products.ts` file into the existing SQLite database (`server/orders.db`).
- The React frontend stops importing `PRODUCTS` and instead fetches `GET /api/products` at runtime.
- The admin UI (`/admin/products`) calls protected endpoints `POST/PUT/DELETE /api/admin/products` using the same `x-admin-token` header as the orders admin.
- Images are uploaded as files to `server/uploads/` and served by the API at `/uploads/<file>`. No external services, no internet needed.
- The backend price mirror (`server/products.mirror.js`) is replaced by a DB read so the server still recomputes order totals from trusted prices.

## Backend changes (`server/`)

1. New table `products` (created on startup, alongside `orders`):
   - `id TEXT PRIMARY KEY` (e.g. `p-501`, auto-generated if missing)
   - `slug TEXT UNIQUE NOT NULL`
   - `name`, `category`, `weight`, `short_description`, `description` (TEXT)
   - `price INTEGER NOT NULL` (Toman), `old_price INTEGER`
   - `badge TEXT`, `in_stock INTEGER DEFAULT 1`
   - `highlights TEXT` (JSON array of strings)
   - `images TEXT NOT NULL` (JSON array of paths; index 0 = cover)
   - `sort_order INTEGER`, `created_at`, `updated_at`
2. One-time seed: on first boot, if `products` is empty, import every entry from a snapshot of `src/data/products.ts` so the live catalog is preserved.
3. Public endpoints (no auth):
   - `GET /api/products` → array of products (frontend catalog).
   - `GET /api/products/:slug` → single product.
4. Admin endpoints (require `x-admin-token`, same env var as orders):
   - `POST   /api/admin/products` — create
   - `PUT    /api/admin/products/:id` — update any field
   - `DELETE /api/admin/products/:id` — delete
   - `POST   /api/admin/products/:id/images` — multipart upload (one or many files), appends to `images[]`
   - `DELETE /api/admin/products/:id/images` — remove an image by path or index
   - `PUT    /api/admin/products/:id/images/reorder` — reorder `images[]` (first = cover)
5. Image storage: `server/uploads/products/<id>/<uuid>.<ext>`. Static-served at `/uploads/...`. Accept jpg/png/webp, ≤5 MB, basic mime check. Use `multer` (added to `server/package.json`).
6. Price-trust update: order-creation path reads prices from the `products` table (not `products.mirror.js`), so deleting that file becomes safe. Totals are still computed server-side.

## Frontend changes (`src/`)

1. `src/lib/productsApi.ts` (new): `fetchProducts()`, `fetchProductBySlug()` against `/api/products`. Plus admin functions (create/update/delete/upload/reorder/removeImage) that send `x-admin-token` from `localStorage` (same key used by orders admin).
2. Replace direct imports of `PRODUCTS` in `Index`, `ProductPage`, `CartPage`, `CategoryGrid`, etc., with a small `useProducts()` hook that fetches once and caches in memory + sessionStorage (so navigation is instant; offline-safe on the VPS LAN).
3. `src/data/products.ts` becomes a type-only file (keeps `Product`, `CATEGORIES`, `formatToman`, `getProductBySlug`-from-list helper). The `PRODUCTS` constant is removed.
4. New page `src/pages/AdminProductsPage.tsx` mounted at `/admin/products`:
   - Token gate identical to `AdminOrdersPage` (reuses `getAdminToken`/`setAdminToken`).
   - Table of products with inline edit + a side panel/dialog for the full form (name, slug, category dropdown from `CATEGORIES`, weight, price, oldPrice, badge, inStock toggle, short/long description, highlights as a chip list).
   - Image manager: drag-and-drop / file picker upload, thumbnails grid, drag-to-reorder (first thumbnail labeled "کاور"), delete button per image.
   - "افزودن محصول" button → empty form.
   - Persian RTL UI consistent with the rest of the site.
5. Route added in `src/App.tsx`: `<Route path="/admin/products" element={<AdminProductsPage />} />`.

## Why no rebuild is needed

Once the catalog is served from SQLite via `/api/products`, the React bundle is unchanged when you add/edit a product. The browser just fetches the new list on next load. Uploaded images live on disk under `server/uploads/` and are served directly by the API. No build step, no redeploy.

## Offline guarantee

- SQLite + local file uploads — no external service calls.
- No CDN dependency for product images (they're served from the same VPS).
- The admin page itself is part of the same bundle and works on LAN.

## You can also add products by chatting with me

After this is built, you can say "add product X, price Y, image: <upload>" and I will call the same admin API (or write a one-off script) to insert it — no code edit, no rebuild.

## Out of scope

- No changes to checkout, Zibal, card-to-card, Telegram/Rubika notifications, or order flow.
- No multi-user admin, no role system (single shared token, same as orders admin).
- No image resizing/CDN (can be added later if needed).

## VPS migration steps (after implementation)

1. Pull code, `cd server && npm install` (adds `multer`).
2. Restart API (`pm2 restart gandomak-api`). On first boot the `products` table is created and seeded from the current catalog.
3. Visit `/admin/products`, enter the existing admin token, manage products freely.
