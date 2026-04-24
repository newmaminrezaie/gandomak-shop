## Enamad Trust Seal Slide-Up Popup

**Goal:** After 10 seconds on the site, slide+fade up a small square Enamad trust seal (no pill background) from the bottom-left corner so visitors notice the trust badge. Dismissible, and won't reappear in the same session.

### What's built

**New file: `src/components/EnamadPopup.tsx`**
- Mounts hidden, then after a 10-second timer becomes visible with a slide-up + fade-in transition (translate-y from `8` → `0`, opacity `0` → `100`, 500ms ease-out).
- Just the square Enamad image (`src/assets/trust/enamad.jpg`) — no pill, no card chrome — wrapped in the official Enamad `trustseal.enamad.ir` link with `data-enamad-code` preserved (so Enamad's verification still works).
- Small circular `X` close button in the corner.
- On dismiss: fades out and writes `enamad-popup-dismissed=1` to `sessionStorage` so it doesn't reappear during the same browsing session.
- Positioned `fixed bottom-4 left-4` (RTL-friendly bottom-left), `z-50`, sized `h-24 w-24` mobile / `h-28 w-28` desktop.

**Edit: `src/App.tsx`**
- Lazy-import `EnamadPopup` and render it inside the existing `DeferredFab`-style deferred mount (or alongside it) so it doesn't impact LCP. Lives outside `<Routes>` so it appears on every page.

### Notes
- Uses Tailwind transition classes (no new keyframes needed).
- `sessionStorage` (not `localStorage`) — so returning visitors in a new session see it again, which matches the "alert viewers" goal without being annoying.
- Respects existing design tokens (`bg-background`, `border-border`, `shadow-elegant`).