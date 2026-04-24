## Findings: where Lovable branding currently lives

Good news — the visible site already has zero Lovable branding:
- `index.html` title, description, OG tags, theme color all use گندمک شاپ.
- `public/favicon.png` and `public/logo.png` are both already the green/gold گندمک roundel (1920×1080 PNG with the brand mark centered).

The remaining Lovable references are:

1. **"Edit with Lovable" floating badge** on the published site — currently `hide_badge: false` (visible).
2. **`vite.config.ts`** — imports and uses `lovable-tagger` (a dev-only plugin that injects `data-lov-id` attributes into JSX during dev for the Lovable editor; ships nothing to production but is still a Lovable code reference).
3. **`package.json`** — `"lovable-tagger": "^1.1.13"` in `devDependencies`.
4. **`README.md`** — starts with "Welcome to your Lovable project" plus instructions and links pointing to lovable.dev.
5. **Favicon shape** — the current `favicon.png` is 1920×1080 with the logo mark only ~10 % of the canvas, so when browsers render it at 16×16 / 32×32 it looks like a tiny dot in a huge empty rectangle. Worth fixing while we're touching favicons.

## Proposed changes

### A. Remove the "Edit with Lovable" badge from the published site
- Call `publish_settings--set_badge_visibility` with `hide_badge: true`.

### B. Re-crop & re-export the favicon so it actually shows the logo
- Generate a square, tightly-cropped favicon from the existing logo:
  - `public/favicon.png` → 256×256, square, transparent background, logo fills ~90 % of the canvas.
  - `public/favicon.ico` → multi-size ICO (16, 32, 48) so legacy browsers and tab bars render crisply.
  - `public/apple-touch-icon.png` → 180×180 with the brand-green background (Apple requires opaque).
- Update `index.html` `<link rel="icon">` tags to reference the new favicon set, with cache-busting query strings so users see the swap immediately.
- `public/logo.png` (used for OG / social share) — re-export as a properly composed 1200×630 OG card with the logo + Persian wordmark on the brand-green background. (Falls back to current logo if you'd rather skip this; let me know.)

### C. Strip Lovable from build config
- `vite.config.ts`: remove the `import { componentTagger } from "lovable-tagger"` line and the `mode === 'development' && componentTagger()` entry from the `plugins` array.
- `package.json`: remove the `"lovable-tagger"` entry from `devDependencies`.
- Run `npm install` so `package-lock.json` is updated and the dependency is dropped from `node_modules`.

Note: removing `lovable-tagger` only affects the in-Lovable visual-edit overlay. Your dev server, build, and production bundle are unchanged.

### D. Replace README.md
Rewrite `README.md` from scratch as a project-specific readme for گندمک شاپ:
- Project name + one-line description (Persian saffron / spice / gift-pack shop).
- Tech stack (React 18 + Vite + Tailwind + TypeScript).
- Local dev commands (`npm install`, `npm run dev`, `npm run build`).
- Deploy notes pointing to `DEPLOY.md`.
- No mention of Lovable, no lovable.dev links.

## Out of scope
- No changes to component source files (no Lovable strings there).
- No changes to `.lovable/plan.md` (internal tooling file, not user-facing).

## Files touched
- `public/favicon.png` (replaced)
- `public/favicon.ico` (new)
- `public/apple-touch-icon.png` (new)
- `public/logo.png` (replaced — optional, confirm)
- `index.html` (favicon link tags)
- `vite.config.ts` (drop tagger plugin)
- `package.json` + `package-lock.json` (drop tagger dep)
- `README.md` (rewritten)
- Lovable publish settings (hide badge)
