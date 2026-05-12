## Goal

Replace Vazirmatn (loaded from Google Fonts CDN) with **Estedad**, fully self-hosted so the site renders 100% offline with no third-party font requests.

## Why Estedad

Estedad is a modern, warm, premium-feeling Persian sans designed as an upgrade to Vazirmatn — better suited for a saffron / spice / gift shop's editorial tone. Free, open-source (SIL OFL), full Latin + Arabic/Persian glyphs, all weights.

## Files to add

Self-hosted woff2 files in `public/fonts/estedad/`:

```
public/fonts/estedad/
  Estedad-Regular.woff2     (400)
  Estedad-Medium.woff2      (500)
  Estedad-SemiBold.woff2    (600)
  Estedad-Bold.woff2        (700)
  Estedad-ExtraBold.woff2   (800)
```

Sourced from the official Estedad GitHub release (`aminabbasi/Estedad-Font`) — fetched once at build time and committed into `public/`. After this, the browser never contacts Google or any external host for fonts.

## Files to change

### `index.html`
- Remove `<link rel="preconnect" href="https://fonts.googleapis.com">`
- Remove `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`
- Remove the Vazirmatn `<link>` and its `<noscript>` fallback (lines ~27–42).
- Add `<link rel="preload" as="font" type="font/woff2" href="/fonts/estedad/Estedad-Regular.woff2" crossorigin>` for the critical weight only.

### `src/index.css`
- Add `@font-face` declarations at the top for all 5 weights with `font-display: swap` and `unicode-range` covering Arabic + Latin.
- Change body `font-family` from `'Vazirmatn', system-ui, ...` to `'Estedad', system-ui, -apple-system, 'Segoe UI', sans-serif`.

### `tailwind.config.ts`
- Update both font tokens:
  ```ts
  sans:    ["Estedad", "system-ui", "sans-serif"],
  display: ["Estedad", "system-ui", "sans-serif"],
  ```

## Out of scope

No layout, color, or component changes. Type sizes/weights stay the same — Estedad's metrics are very close to Vazirmatn so no spacing tweaks needed.

## Verification

After implementation: open the site offline (DevTools → Network → "Offline") and confirm text still renders in Estedad with no failed font requests.
