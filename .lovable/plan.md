## Goal
Fix: clicking a product card on the home page navigates to the single product page but lands at the bottom (because the previous scroll position is preserved). It should always start at the top of the new page.

## Root cause
React Router does not auto-scroll to the top on route change.

## Steps

1. **Create `src/components/ScrollToTop.tsx`** — a tiny component that watches `pathname` from `useLocation()` and calls `window.scrollTo({ top: 0, left: 0 })` on every change.

2. **Mount it inside `<BrowserRouter>` in `src/App.tsx`** — add the import and render `<ScrollToTop />` right after `<BrowserRouter>` opens, before `<Suspense>`.

## Files to change
- new: `src/components/ScrollToTop.tsx`
- edit: `src/App.tsx` (one import + one line inside BrowserRouter)

## Note
This fixes navigation across all routes (product pages, cart, payment callback, 404), not just product pages.
