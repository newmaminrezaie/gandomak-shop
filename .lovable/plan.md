## Goal

Add a private admin page to review all placed orders + their full details. Make it work **offline** by caching the last successful fetch in `localStorage` so you can still browse the most recent snapshot when the network or server is unreachable.

## Why localStorage and not a service worker / PWA

Order data changes constantly and is server-authoritative — a service worker would risk caching stale builds in the Lovable preview iframe and break route navigation. A simple `localStorage` snapshot is the right tool: instant, scoped to this page, and safe.

## Page

Route: **`/admin/orders`** (not linked anywhere; access by typing the URL)

```text
┌────────────────────────────────────────────────────────────┐
│ 📦 سفارش‌ها (۱۲)   [آفلاین] [از حافظه] [تازه‌سازی] [خروج] │
├────────────────────────────────────────────────────────────┤
│ [همه][پرداخت‌شده][بررسی][در انتظار][ناموفق]   🔍 جستجو...   │
├────────────────────────────────────────────────────────────┤
│ کد │ مشتری │ موبایل │ مبلغ │ روش │ وضعیت │ تاریخ            │
│ ─── کلیک روی ردیف → کشوی جزئیات از سمت چپ ───             │
└────────────────────────────────────────────────────────────┘
```

Detail drawer shows: customer (name + phone with تماس/کپی, address + کدپستی), payment block (روش، کد رهگیری، شماره مرجع، رسید کارت، تاریخ پرداخت), itemized list, جمع اقلام / بسته‌بندی / مجموع.

## Offline behavior

- On mount: hydrate UI immediately from cached snapshot (if any) so the page is usable with zero network.
- Every successful fetch overwrites the cache.
- If `fetch` throws (offline) or returns non-OK, fall back to cache and show an "از حافظه" badge plus a small banner explaining the staleness.
- Listen to `online` / `offline` events — auto-refetch when the connection returns; show a "آفلاین" indicator otherwise.
- Auto-refresh every 30s only when the tab is visible **and** `navigator.onLine` is true.
- 401 from server → clear stored token and return to the login screen.

## Auth

Server endpoint `GET /api/orders` already requires header `x-admin-token: <ADMIN_TOKEN>`. The page prompts for the token on first visit and stores it in `localStorage` (`gandomak_admin_token`). A "خروج" button clears it.

## Files

**New**
- `src/lib/adminApi.ts` — typed `AdminOrder`, token helpers, `fetchOrders(token)` with offline-cache fallback (`gandomak_admin_orders_cache` in localStorage).
- `src/pages/AdminOrdersPage.tsx` — token gate + sticky header (status tabs, search, refresh, online/cache indicators) + responsive table/cards + detail `Sheet` drawer.

**Edited**
- `src/App.tsx` — lazy-import `AdminOrdersPage` and add `<Route path="/admin/orders" />` above the `*` catch-all. Floating call/Enamad already only show on `/`, so this page stays clean.

## Technical notes

- Uses existing shadcn primitives: `Sheet`, `Tabs`, `Input`, `Button`, `Badge`. No new deps.
- Reuses `formatToman` from `src/data/products.ts` and `Seo` for `<title>`.
- Status colors via semantic tokens (`primary`, `accent`, `destructive`, `muted`) — no hardcoded colors.
- Cache shape: `{ fetchedAt: ISO, orders: AdminOrder[] }`; safely ignored if JSON parse fails.
- Read-only in this iteration (no mutations). "Mark as shipped / approve card payment" can come later.
