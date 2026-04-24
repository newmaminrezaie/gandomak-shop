## Goal
Replace the header/hero wordmark with the new uploaded `logo3.png` (green "گندمک" with gold wheat), and replace the footer logo with the new `Final-0۱-2.png` (arched green/gold badge with "GANDOMAK").

## New assets
- `user-uploads://logo3.png` → wide horizontal lockup (~2:1). Use for **header** + **hero heading**.
- `user-uploads://Final-0۱-2.png` → tall arched badge (~1:1.05, slightly taller than wide). Use for **footer**.

## Steps

1. **Copy assets into the project**
   - `user-uploads://logo3.png` → `src/assets/gandomak-wordmark.png` (overwrites the old PNG; will become the active wordmark again).
   - `user-uploads://Final-0۱-2.png` → `src/assets/gandomak-footer-logo.png` (overwrites existing footer asset).

2. **Header (`src/components/Header.tsx`)**
   - Switch import from `gandomak-wordmark.svg` → `gandomak-wordmark.png`.
   - Keep height `h-8 sm:h-10` (good fit for the new ~2:1 lockup inside the 64px header).

3. **Hero heading (`src/components/CategoryGrid.tsx`)**
   - Switch import from `gandomak-wordmark.svg` → `gandomak-wordmark.png`.
   - Bump height from `h-12 sm:h-16` → `h-14 sm:h-20` so the wider lockup reads as a proper hero title.

4. **Footer (`src/components/Footer.tsx`)**
   - Keep the existing `import footerLogo from "@/assets/gandomak-footer-logo.png"` (file is being replaced on disk).
   - The arched badge is taller and more detailed than the previous footer mark, so increase the rendered size from `h-24` → `h-28 sm:h-32` and ensure `w-auto object-contain` is preserved (already is).

5. **Cleanup**
   - Leave `src/assets/gandomak-wordmark.svg` on disk (no remaining references). Safe to ignore.

## Files to change
- replace (binary): `src/assets/gandomak-wordmark.png`
- replace (binary): `src/assets/gandomak-footer-logo.png`
- edit: `src/components/Header.tsx` (import + keep sizing)
- edit: `src/components/CategoryGrid.tsx` (import + size bump)
- edit: `src/components/Footer.tsx` (size bump only)

## Notes
- Both new logos have light/cream backgrounds baked in. The header sits on `bg-background/85` (cream) and the footer on `bg-card`, so they should blend well. If the cream square around the footer badge looks too boxy on your background, say the word and I'll either crop/transparent-ify or add a matching rounded container.
