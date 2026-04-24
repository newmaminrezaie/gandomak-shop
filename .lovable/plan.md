## Goal
Use the **footer's arched GANDOMAK badge** as the logo in the header (menu) too, so both spots match.

## Steps

1. **Header (`src/components/Header.tsx`)**
   - Change import from `@/assets/gandomak-wordmark.png` → `@/assets/gandomak-footer-logo.png`.
   - The badge is roughly square/tall (vs. the previous wide wordmark), so shrink the rendered size from `h-8 sm:h-10` → `h-12 sm:h-14` to keep it readable inside the 64px header without overflowing. (`h-14` = 56px, leaves 4px top/bottom padding.)

2. **Hero heading (`src/components/CategoryGrid.tsx`)**
   - Open question: the hero currently also uses the wide wordmark (`gandomak-wordmark.png`) at `h-14 sm:h-20`. You said "header and footer be the same" — leaving the hero alone by default, since the wide green/gold wordmark works better as a big page title than the badge would.
   - If you want the hero swapped too, say the word and I'll point it at the badge with `h-20 sm:h-28`.

3. **Footer (`src/components/Footer.tsx`)**
   - No change — already uses `gandomak-footer-logo.png`.

## Files to change
- edit: `src/components/Header.tsx` (import path + size classes)

## Note
The badge has a baked-in dark-green background, so it will read as a solid tile in the cream header bar — that's expected (matches what you have in the footer).
