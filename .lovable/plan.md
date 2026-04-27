# Remove order caching

Strip the localStorage caching layer from the admin orders feature. The admin page will simply fetch live from `/api/orders` every time; if the network fails, it shows an error instead of a stale snapshot.

## Changes

**`src/lib/adminApi.ts`**
- Remove `CACHE_KEY`, `readOrdersCache`, `writeOrdersCache`, and the `CacheShape` type.
- Simplify `fetchOrders` to: call the endpoint, return `{ ok: true, orders, fetchedAt }` on success, or `{ ok: false, error }` on failure. No cache fallback.
- Remove the `fromCache` field from `FetchResult`.
- Keep `getAdminToken` / `setAdminToken` / `clearAdminToken` (token storage is unrelated).
- Add a one-time cleanup line that deletes any pre-existing `gandomak_admin_orders_cache` key from `localStorage`, so users who already have the stale snapshot get it wiped on next load.

**`src/pages/AdminOrdersPage.tsx`**
- Remove the "From Cache" badge and any UI/logic that branches on `fromCache`.
- Keep the "Offline" indicator only as a plain network-error message.

## Files NOT touched
- `src/components/MiniCart.tsx`, `src/components/Header.tsx`, `src/lib/cart.ts`, `src/App.tsx` — unrelated to order caching.

This will not affect the home page either way, but it removes the cache layer you asked to disable.
