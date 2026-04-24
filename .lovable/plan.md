
# گندمک شاپ — Mobile-first RTL Persian Online Store

A fast, SEO-optimized, mobile-first Persian shop with a full RTL UI, a hero-replacing category grid built from your photos, a hardcoded product catalog in `products.ts`, and a Zarinpal-ready order flow via a Node/Express backend you'll deploy to your Iranian VPS.

## What you'll get

**Storefront (3 pages, mobile-first)**
- **Home (`/`)** — sticky top bar with logo + cart, an artful 8-tile category grid using your uploaded photos as the visual hero, "پرفروش‌ها" rail, full product grid filterable by category, footer with contact + trust badges.
- **Product detail (`/product/:slug`)** — image gallery (swipeable on mobile), price, weight, badge, highlights bullets, description, sticky "افزودن به سبد" bar at bottom on mobile, related products.
- **Cart & checkout (`/cart`)** — line items with qty steppers, totals in Toman, shipping note, customer form (name, phone, province/city, address, postal code, optional notes), "پرداخت با زرین‌پال" button.

**Visual identity**
- Deep forest green (#0E4A36-ish) primary + warm copper/gold accent + cream background, all wired through `index.css` HSL tokens and `tailwind.config.ts` (no hardcoded colors in components).
- Vazirmatn font (Persian) loaded from Google Fonts; full `dir="rtl"` + `lang="fa"` on `<html>`.
- Logo (`Final-0۵.png`) used in header, footer, favicon, and OG image.

**Category grid (the "hero")**
A responsive masonry-style tile grid (2 cols mobile → 4 cols desktop) covering the full first viewport. Each tile = one category with a curated photo + Persian label overlay with copper bottom-gradient:

| Tile | Image | Label |
|---|---|---|
| ادویه | `photo19103423004.jpg` (spice box outdoors) | ادویه |
| پک ۱۲تایی | `IMG_20260222_220744_927.jpg` | پک هدیه |
| دمنوش و چای | `photo21354608762_1.jpg` (teapot) | دمنوش و چای |
| زعفران | `image.png` (saffron + box) | زعفران |
| پرطرفدار | `photo18431536132.jpg` (basket of jars) | پرطرفدار |
| پک یلدا/گل | `photo22467440919.jpg` (dried flowers) | پک هدیه ویژه |
| تازه‌ها | `photo19103402979.jpg` (mini bottles row) | تازه‌ها |
| محصول واحد | `photo19344973956.jpg` (hand holding jar) | همه محصولات |

Tapping a tile scrolls to and filters the product grid below.

**Products**
All 18 products you listed go into `src/data/products.ts` with the exact schema, helpers (`formatToman`, `getProductBySlug`), and the file-top edit instructions preserved verbatim. Product images are referenced as `/images/<file>.webp` — you drop them into `public/images/` on your VPS and they just work.

**Zero-price handling**
Products with `price: 0` show "تماس بگیرید" instead of a price, and the CTA becomes a "tel:" link to your shop number rather than add-to-cart.

## Checkout & payments (Iranian VPS)

Since you're hosting on the Iranian intranet with Zarinpal/Sep, the React app is the storefront only. Payment requires a small backend you'll run alongside it on the same VPS.

**Frontend (in this project)**
- Cart state in `localStorage` via a lightweight `useCart` hook.
- On checkout: POST `/api/order` → backend returns `{ paymentUrl }` → redirect to Zarinpal.
- Verify page `/payment/callback` reads `Authority` + `Status` from query string, POSTs to `/api/verify`, shows success/failure.

**Backend (separate folder `server/` — you run with `node server/index.js`)**
A minimal Express server I'll scaffold with:
- `POST /api/order` — validates cart, computes total server-side from a mirrored products list, calls Zarinpal `PaymentRequest`, stores pending order in a JSON file (`orders.json`) — no DB needed for v1.
- `POST /api/verify` — calls Zarinpal `PaymentVerification`, marks order paid, returns `RefID`.
- `GET /api/orders` — basic admin list, protected by a simple `ADMIN_TOKEN` header.
- `.env.example` with `ZARINPAL_MERCHANT_ID`, `CALLBACK_URL`, `ADMIN_TOKEN`, `SHOP_PHONE`.
- Sandbox endpoint switch for testing before going live.

You'll deploy by: `npm run build` (frontend) → serve `dist/` via Nginx → reverse-proxy `/api/*` to the Node process (pm2). I'll include a short `DEPLOY.md` with the exact Nginx block.

## SEO & performance

- Per-page `<title>`, `<meta description>`, canonical, and OpenGraph tags via a tiny `<Seo>` component (no extra deps).
- JSON-LD `Product` schema injected on each product page (name, image, price, availability, brand "گندمک").
- JSON-LD `Organization` + `WebSite` on home.
- `public/robots.txt` allowing all + sitemap reference.
- `public/sitemap.xml` generated at build time via a small `scripts/gen-sitemap.mjs` that reads `products.ts`.
- Persian-friendly slugs, semantic `<h1>/<h2>`, descriptive `alt` text in Persian.
- Lazy-loaded product images (`loading="lazy"`, `decoding="async"`), responsive `srcset` where useful.
- Code-split product detail route, prefetch on tile hover.
- Preconnect to Google Fonts, font-display: swap.
- Lighthouse target: 95+ mobile.

## Mobile-first specifics

- Sticky bottom "افزودن به سبد" bar on product page.
- Sticky top bar with cart badge (count) always visible.
- Tap targets ≥ 44px, large numerals for prices.
- Bottom-sheet style category filter on mobile (chips on desktop).
- Swipeable image gallery using existing `embla-carousel` (already in shadcn/ui carousel).
- Persian numerals everywhere via `Intl.NumberFormat("fa-IR")`.

## Technical layout

```text
src/
  data/products.ts            ← single source of truth (your spec, verbatim header)
  lib/cart.ts                 ← useCart hook (localStorage)
  lib/seo.tsx                 ← <Seo> + JSON-LD helpers
  lib/format.ts               ← formatToman, toFaDigits
  components/
    Header.tsx, Footer.tsx
    CategoryGrid.tsx          ← the hero-replacement tile grid
    ProductCard.tsx, ProductGrid.tsx
    CategoryChips.tsx
    CartDrawer.tsx (optional quick-view)
    StickyBuyBar.tsx
  pages/
    Index.tsx                 ← home
    ProductPage.tsx           ← /product/:slug
    CartPage.tsx              ← /cart
    PaymentCallback.tsx       ← /payment/callback
    NotFound.tsx
public/
  images/                     ← drop product photos here on VPS
  categories/                 ← category tile photos (copied from your uploads)
  logo.png, favicon.ico, robots.txt, sitemap.xml
server/                       ← Express + Zarinpal
  index.js, zarinpal.js, products.mirror.js, orders.json, .env.example
DEPLOY.md                     ← Nginx + pm2 instructions
```

Tailwind + shadcn/ui stay; I'll add an `[dir="rtl"]` body class and flip a few utility usages where needed (e.g., `me-`/`ms-` logical spacing).

## Out of scope for v1 (easy to add later)
- User accounts / order history page for customers
- Discount codes
- Inventory sync (single source is `products.ts`)
- Multi-language

If you approve, I'll build the storefront + scaffold the `server/` folder + `DEPLOY.md` in one pass. You'll only need to add your Zarinpal merchant ID to `server/.env` on the VPS.
