## Goal
Replace the current PNG wordmark (`@/assets/gandomak-wordmark.png`) with the uploaded SVG `Final-0۳.svg` everywhere it's used, and rescale heights so the new logo doesn't look too small/large given its different aspect ratio.

## Aspect ratio note
- Old PNG wordmark renders roughly square-ish (text-only "گندمک" lockup).
- New SVG has `viewBox="0 0 1920 1080"` → **~1.78:1 (16:9)**, and includes the wheat/G monogram + "گندمک" wordmark side by side.
- At the same height, the new logo will be visually wider and the text portion will look smaller. So we **reduce height ~20%** to keep visual balance, while the wider footprint still gives the wordmark presence.

## Steps

1. **Add the SVG asset**
   - Copy `user-uploads://Final-0۳.svg` → `src/assets/gandomak-wordmark.svg` (renamed to ASCII for safe imports).

2. **Update `src/components/Header.tsx`**
   - Change import to `import wordmark from "@/assets/gandomak-wordmark.svg";`
   - Update `<img>` className from `h-10 sm:h-12` → `h-8 sm:h-10` (compensates for wider aspect; keeps header height of 16 comfortable).

3. **Update `src/components/CategoryGrid.tsx`** (hero heading)
   - Change import to the new SVG.
   - Update `<img>` className from `h-16 sm:h-20` → `h-12 sm:h-16` (still hero-sized but proportional).

4. **Leave the Footer alone**
   - Footer uses a different asset (`gandomak-footer-logo.png`) — not the wordmark, so it stays as-is.

5. **Optional cleanup**
   - The old `src/assets/gandomak-wordmark.png` becomes unused. Leave it on disk (no risk) or delete; deletion is safe since no remaining references.

## Files to change
- new: `src/assets/gandomak-wordmark.svg`
- edit: `src/components/Header.tsx`
- edit: `src/components/CategoryGrid.tsx`

## Open question (will assume "no" unless you say otherwise)
Should the **footer logo** also be swapped to this same SVG? Right now it's a separate `gandomak-footer-logo.png` (a stacked/badge variant). Default plan keeps it untouched.
