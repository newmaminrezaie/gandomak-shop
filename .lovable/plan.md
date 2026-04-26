## Goal

Replace the Zarinpal flow in the Express backend with **Zibal** as the primary online payment gateway, persist orders in **SQLite** (instead of `orders.json`), and send a **Telegram notification** on every successful payment. Keep the existing card-to-card branch working.

## Backend changes (`server/`)

### 1. `package.json` — new dependencies
Add: `zibal`, `better-sqlite3`, `dotenv`.

### 2. `.env.example` — replace contents
```
# Zibal
ZIBAL_MERCHANT_ID=68df9f49a45c720017c9e144
# (use 'zibal' for sandbox)

# Telegram notifications
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

# Card-to-card destination
CARD_NUMBER=6063731055805767
CARD_HOLDER=سمیرا رشیدی

# Public callback URL (must match Zibal panel)
CALLBACK_URL=https://gandomakshop.ir/payment/callback

# Admin
ADMIN_TOKEN=please-change-me
PORT=3001
```

### 3. `db.js` (new) — SQLite layer
- Open `better-sqlite3` at `server/orders.db`.
- Create table `orders` if missing with columns:
  `id` (TEXT PK), `customer_name`, `customer_phone`, `customer_address`, `customer_postalcode`, `items` (JSON TEXT), `total_toman` (INT), `total_rial` (INT), `track_id` (TEXT), `card_number` (TEXT), `paid_at` (TEXT), `status` (TEXT: pending/paid/failed/awaiting_review), `created_at` (TEXT), plus `payment_method`, `card_ref`, `ref_number` for card-to-card + Zibal ref number.
- Export helpers: `insertOrder`, `updateOrderStatus`, `getOrderByTrackId`, `listOrders`.
- One-time migration: if `orders.json` exists, import its rows on boot, then rename to `orders.json.bak`.

### 4. `telegram.js` (new)
`notifyPaidOrder(order)` — POSTs to `https://api.telegram.org/bot<TOKEN>/sendMessage` with HTML body:
```
✅ سفارش پرداخت‌شده
کد سفارش: {id}
نام: {name}
تلفن: {phone}
آدرس: {address}
کدپستی: {postalcode}
اقلام:
 • {name} × {qty} — {price}
جمع کل: {total} تومان
```
No-op if `TELEGRAM_BOT_TOKEN`/`TELEGRAM_CHAT_ID` are missing (log warning).

### 5. `index.js` — rewrite the Zibal branch and verify route

**`POST /api/order`** (server-side total stays the same, computed from `products.mirror.js`):
- `paymentMethod === "card"` → unchanged behavior, but persist via SQLite.
- `paymentMethod === "zibal"` (default for online):
  1. Build `merchant = process.env.ZIBAL_MERCHANT_ID || "zibal"`.
  2. Call `https://gateway.zibal.ir/v1/request` with:
     ```json
     {
       "merchant": "...",
       "amount": totalRial,
       "callbackUrl": `${CALLBACK_URL}?provider=zibal`,
       "description": "سفارش گندمک شاپ - {name}",
       "mobile": customer.phone,
       "orderId": orderId
     }
     ```
  3. If `result === 100`, save order with `status='pending'`, `track_id=trackId`, return `{ paymentUrl: "https://gateway.zibal.ir/start/{trackId}" }`.
  4. Otherwise return 502 with the upstream `result`/`message`.
- Drop the Zarinpal call entirely.

**`GET /payment/callback`** (new server route — Zibal redirects here as a GET):
- Read `trackId`, `success`, `status`, `orderId` from query.
- Find order by `track_id`.
- If `success !== "1"` → mark `failed`, redirect `302 → /payment/failed?trackId=...`.
- Else POST to `https://gateway.zibal.ir/v1/verify` with `{ merchant, trackId }`.
  - If `result === 100` (or `201` already-verified): mark `paid`, set `paid_at = now`, save `ref_number`, call `notifyPaidOrder(order)` (fire-and-forget, errors logged), redirect `302 → /payment/success?trackId=...&refId=...`.
  - Else mark `failed`, redirect `302 → /payment/failed?trackId=...`.

**Keep**: `/api/health`, `/api/payment/card`, `/api/orders` (admin), `/api/verify` becomes a thin wrapper that returns the order's stored status by `trackId` (used by the success page to show ref number).

### 6. Frontend wiring (minimal)
- `src/pages/CartPage.tsx` — remove the "زیبال هنوز فعال نیست" guard so selecting **Zibal** posts the order with `paymentMethod: "zibal"` and on success does `window.location.href = paymentUrl`.
- `src/pages/PaymentCallback.tsx` — already reads `refId`/`method` from query; update it to also read `trackId` and call `/api/verify` with `{ trackId }` (instead of `authority`) when arriving at `/payment/success`. `/payment/failed` route reuses the existing failed UI.
- `src/App.tsx` — add routes `/payment/success` and `/payment/failed` pointing at `PaymentCallback` (the component already branches on state).

## Notes / decisions

- **Currency**: `products.ts` prices are in Toman; Zibal expects **Rial** → multiply by 10 (same as the previous Zarinpal code).
- **Sandbox**: defaults to the provided merchant `68df9f49a45c720017c9e144`. Set `ZIBAL_MERCHANT_ID=zibal` in `.env` to use Zibal's public sandbox merchant.
- **SQLite location**: `server/orders.db` (gitignored implicitly — it's runtime state). One-time import from `orders.json` preserves any existing orders.
- **Telegram**: silent no-op when credentials are missing so local dev still works.
- **Callback URL**: must be set in the Zibal panel to `https://<your-domain>/payment/callback` — Nginx should proxy that path (and `/api/*`) to the Node process on `PORT=3001`.

## Files touched

- **New**: `server/db.js`, `server/telegram.js`
- **Edit**: `server/index.js`, `server/package.json`, `server/.env.example`, `src/pages/CartPage.tsx`, `src/pages/PaymentCallback.tsx`, `src/App.tsx`
- **Remove**: Zarinpal code paths inside `server/index.js` (the file `orders.json` is migrated then renamed on first boot)
