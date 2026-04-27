## Goal

Restrict the floating Enamad trust seal popup so it appears **only on the home page (`/`)**, and not on the cart, checkout, product, payment, or 404 pages. The floating call button stays everywhere as today.

## Changes

**`src/App.tsx`** — gate `<EnamadPopup />` by route inside the `DeferredFab` component.

- Import `useLocation` from `react-router-dom`.
- In `DeferredFab`, read `location.pathname` and compute `isHome = pathname === "/"`.
- Render `<EnamadPopup />` only when `isHome` is true. `<FloatingCallButton />` continues to render on all routes.

```tsx
const location = useLocation();
const isHome = location.pathname === "/";
...
<FloatingCallButton />
{isHome && <EnamadPopup />}
```

No other files need changes. The popup's existing 10s delay and session-dismiss behavior remain intact.
