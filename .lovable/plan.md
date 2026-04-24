## Performance Pass — Don't Block First Paint, Be Kind to Slow Networks

Goal: keep the home page fast on 3G. Initial JS only ships what `/` needs; everything else (other routes, FAB, fonts) loads after first paint.

### 1. `index.html` — non-blocking webfont

Right now `<link rel="stylesheet" href=".../Vazirmatn...">` is render-blocking — the browser refuses to paint until the CSS arrives. On slow networks this dominates LCP. Swap it for the standard async-CSS pattern and drop the unused `300` weight:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  rel="preload"
  as="style"
  href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700;800&display=swap"
  onload="this.onload=null;this.rel='stylesheet'"
/>
<noscript>
  <link rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700;800&display=swap" />
</noscript>
```

`display=swap` (already in URL) means text renders immediately in the system fallback and re-paints when Vazirmatn arrives — no invisible-text flash.

### 2. `src/App.tsx` — code-split routes + defer the FAB

- Keep `Index` eagerly imported (it's the home page; lazy-loading it would add a network round-trip on the most common entry).
- `lazy()` everything else: `ProductPage`, `CartPage`, `PaymentCallback`, `NotFound`, and `FloatingCallButton`.
- Wrap `<Routes>` in `<Suspense fallback={<RouteFallback />}>` (a tiny "در حال بارگذاری…" stub — no extra component imports).
- Mount the FAB inside a new `<DeferredFab>` wrapper that waits for `requestIdleCallback` (with a `setTimeout(1500)` fallback) before even loading its chunk. This means the floating button's JS doesn't compete with the home page for bandwidth or CPU.
- Tighten React Query defaults: `staleTime: 60_000`, `refetchOnWindowFocus: false` — fewer redundant requests on flaky networks.

### 3. `vite.config.ts` — manual vendor chunks

Today everything lands in one `vendor.js`. Split so the home page only downloads what it actually uses, and the rest can stream in (or stay cached) per-route:

```ts
build: {
  outDir: "dist/client",
  emptyOutDir: true,
  target: "es2020",
  cssCodeSplit: true,
  sourcemap: false,
  chunkSizeWarningLimit: 900,
  rollupOptions: {
    output: {
      manualChunks(id) {
        if (!id.includes("node_modules")) return;
        if (id.includes("react-router")) return "router";
        if (id.includes("@tanstack")) return "query";
        if (id.includes("@radix-ui")) return "radix";
        if (id.includes("lucide-react")) return "icons";
        if (id.includes("recharts") || id.includes("d3-")) return "charts";
        if (id.includes("embla-carousel")) return "carousel";
        if (id.includes("sonner") || id.includes("vaul") || id.includes("cmdk")) return "ui-misc";
        if (id.includes("react-day-picker") || id.includes("date-fns")) return "calendar";
        if (id.includes("react-hook-form") || id.includes("@hookform") || id.includes("zod")) return "forms";
        return "vendor";
      },
    },
  },
},
```

Effect: `recharts`, `react-day-picker`, `embla`, etc. only download when a page that actually imports them is visited.

### 4. `src/components/FloatingCallButton.tsx` — minor

The component itself is already small. Once it's lazy-loaded by `<DeferredFab>` no further changes needed; its 5 s timer keeps running as designed but starts only after idle, which is fine (slightly later appearance on slow devices, intentional).

### Files changed

- **edited** `index.html` (async font load, drop weight 300)
- **edited** `src/App.tsx` (lazy routes + Suspense + DeferredFab + Query defaults)
- **edited** `vite.config.ts` (manual chunks + build tweaks)

### Out of scope (flag for later if needed)

- Self-hosting Vazirmatn subset (would remove the Google Fonts hop entirely — biggest remaining win on slow networks, but requires committing `.woff2` files).
- Image preloading / `fetchpriority="high"` on the hero image.
- A service worker for offline / repeat-visit caching.

Let me know if you want any of those next.
