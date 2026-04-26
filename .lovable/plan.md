## Changes

### 1. Category grid restructure (`src/components/CategoryGrid.tsx`)
Currently the bottom of the 4-column grid has 4 small tiles: پرطرفدارها, هدیه ویژه, تازه‌ها, همه محصولات.

- Remove **همه محصولات** and **تازه‌ها** tiles.
- Add a new **خشکبار** tile using the uploaded dried-fruits image.
- Final last row will contain 3 tiles (col-span-2 + col-span-1 + col-span-1 layout, or three equal cards) — final TILES order:
  1. زعفران اصل (col-span-2 row-span-2) — unchanged
  2. ادویه‌جات
  3. دمنوش و چای
  4. پک هدیه (col-span-2)
  5. پرطرفدارها
  6. هدیه ویژه
  7. **خشکبار** (new) — col-span-2 to fill out the last row cleanly with the two existing single tiles, OR adjust spans so the bottom row shows exactly 3 cards.

Final layout target (the user asked for "three cards at the last row"):

```text
Row 1-2: [ زعفران (2x2) ][ ادویه ][ دمنوش ]
Row 2:                  [ پک هدیه (col-span-2) ]
Row 3 (last): [ پرطرفدارها ][ هدیه ویژه ][ خشکبار (col-span-2) ]
```

Since the grid is 4 columns, "three cards" on the last row works as 1 + 1 + 2 spans. Will implement that.

Image asset:
- Copy `user-uploads://dried-fruits-category.jpg` → `src/assets/cat-dried-fruits.jpg` and import as `catDriedFruits`.
- Category string: `"خشکبار"` (will not yet exist in `CATEGORIES` of `src/data/products.ts`, but the existing tile click handler simply scrolls + filters — clicking it will result in an empty filtered list until products are added; acceptable per request scope).

### 2. Card-to-card payment holder (`src/pages/CartPage.tsx`)
- Change `const CARD_HOLDER = "سمیرا رشیدی";` → `const CARD_HOLDER = "یاسر شمسی";`

### 3. Footer addresses (`src/components/Footer.tsx`)
Replace the single address line `خراسان رضوی، قائن` with three branches, each with its own MapPin row:
- شعبه ۱: قائن، معلم ۱۲
- شعبه ۲: گناباد، خ ایثار ۱، پلاک ۸٫۰۰۱
- شعبه ۳: مشهد، کوثر ۵۸

Will use Persian digits to match the rest of the footer styling.

## Files touched
- `src/components/CategoryGrid.tsx` — edit
- `src/assets/cat-dried-fruits.jpg` — new (copied from upload)
- `src/pages/CartPage.tsx` — edit (one-line constant)
- `src/components/Footer.tsx` — edit (address list)
