## Goal

Restrict the floating call button (phone icon) to appear **only on the home page (`/`)**, matching the Enamad popup behavior.

## Changes

**`src/App.tsx`** — gate `<FloatingCallButton />` by route inside `DeferredFab`, reusing the existing `isHome` check.

```tsx
{isHome && <FloatingCallButton />}
{isHome && <EnamadPopup />}
```

No other files need changes.
