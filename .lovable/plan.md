## Lighter Overlay on Category Images

**Goal:** Reduce the darkness of the gradient overlay on category grid tiles so the product photography is more visible.

**Change:**
In `src/index.css`, adjust the `--gradient-tile-fade` custom property to use lower opacity values.

**Current:**
`linear-gradient(to top, hsl(158 65% 12% / 0.85) 0%, hsl(158 65% 12% / 0.25) 50%, transparent 100%)`

**Proposed:**
`linear-gradient(to top, hsl(158 65% 12% / 0.50) 0%, hsl(158 65% 12% / 0.10) 50%, transparent 100%)`

This keeps the text-readable dark band at the bottom but lets much more of the image show through in the middle and top of each tile.