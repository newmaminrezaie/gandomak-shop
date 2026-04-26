## Goal

Replace the spices and saffron category images with the two newly uploaded photos, and swap their positions in the homepage category grid so **ادویه‌جات (spices)** becomes the large square tile and **زعفران (saffron)** becomes a small tile.

## Image assignments

- `IMG_20260425_205316_298.jpg` (basket of colorful spice jars) → **spices** category
- `IMG_20260426_170154_014.jpg` (saffron threads + decorated tin) → **saffron** category

## Changes

### 1. Add new images to `src/assets/`
Copy the two uploads into the assets folder, replacing the existing files so all imports keep working:
- `src/assets/cat-spices.jpg` ← `IMG_20260425_205316_298.jpg`
- `src/assets/cat-saffron.jpg` ← `IMG_20260426_170154_014.jpg`

(Overwriting in place means no import paths in `CategoryGrid.tsx` need to change for the image swap itself.)

### 2. Swap tile positions in `src/components/CategoryGrid.tsx`

Current `TILES` array (top of grid):
```
{ label: "زعفران اصل", category: "زعفران", image: catSaffron, span: "col-span-2 row-span-2" },
{ label: "ادویه‌جات",  category: "ادویه",  image: catSpices },
```

After change — spices takes the large 2×2 square, saffron takes the small slot:
```
{ label: "ادویه‌جات",  category: "ادویه",  image: catSpices,  span: "col-span-2 row-span-2" },
{ label: "زعفران اصل", category: "زعفران", image: catSaffron },
```

All other tiles (tea, gift pack, popular, special gift, dried fruits) remain unchanged.

## Notes

- Both uploaded images are portrait/vertical. The grid uses `object-cover`, so they will be cropped to fit — the spice basket image works well for the square 2×2 large tile, and the saffron image sits fine in the smaller cell.
- No other files are affected (no product data, no SEO, no routing changes).
