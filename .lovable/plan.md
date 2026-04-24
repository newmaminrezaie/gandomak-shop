## Add Trust Seals Strip to Footer

Add a new "trust seals" row above the copyright line in `src/components/Footer.tsx` containing the live Enamad seal plus three placeholder pill-shaped slots for future seals (eNamad badge, Emalls, Post-IR). All seals share a uniform "small square pill" style so the strip looks balanced even before the placeholders are wired up.

### What gets added

1. **Save uploaded assets** to `src/assets/trust/`:
   - `src/assets/trust/enamad.jpg` ← copied from `user-uploads://EnamadLogo2.jpg` (used as the Enamad seal image, replacing the remote `trustseal.enamad.ir/logo.aspx` image so it always renders fast and isn't blocked by referrer rules)
   - `src/assets/trust/emalls.svg` ← copied from `user-uploads://Emalls.svg` (placeholder slot image)
   - `src/assets/trust/post-ir.png` ← copied from `user-uploads://Post-ir2.png` (placeholder slot image)

2. **Footer.tsx — new "Trust seals" block** inserted between the contact grid (line 67 `</div>`) and the copyright `<div>` (line 69):
   - A centered flex row, wraps on mobile, ~16px gap.
   - Each item is a square white pill: `h-20 w-20 rounded-xl bg-background border border-border flex items-center justify-center p-2 hover:shadow-elegant transition-smooth`. Image inside uses `max-h-full max-w-full object-contain`.
   - **Slot 1 — Enamad (live link):**
     ```tsx
     <a
       referrerPolicy="origin"
       target="_blank"
       rel="noreferrer"
       href="https://trustseal.enamad.ir/?id=655583&Code=i679RnaSXE7EUpN1xFeht0NynDKCAwub"
       className="h-20 w-20 rounded-xl bg-background border border-border flex items-center justify-center p-2 hover:shadow-elegant transition-smooth"
     >
       <img
         src={enamadSeal}
         alt="نماد اعتماد الکترونیکی"
         referrerPolicy="origin"
         data-enamad-code="i679RnaSXE7EUpN1xFeht0NynDKCAwub"
         className="max-h-full max-w-full object-contain"
       />
     </a>
     ```
     Note: the snippet you pasted relies on `code="..."` which Enamad's verifier reads on click; we keep the same value via `data-enamad-code` (valid HTML) and preserve `referrerPolicy="origin"` on both the anchor and the image so the verifier still recognizes the seal.
   - **Slots 2–4 — Placeholders (no link yet):** same pill styling but rendered as a `<div>` with `aria-label` (e.g. "ای‌مالز", "پست جمهوری اسلامی ایران", and one extra empty placeholder reserved for a future seal). Image source uses the saved Emalls / Post-IR assets; the third placeholder uses a neutral `bg-muted` empty pill with a small `…` so the row keeps its rhythm.

3. **Section heading** above the row (small, muted): `<div className="text-xs text-muted-foreground text-center mb-3">نمادهای اعتماد</div>` so the strip reads as a labelled trust band.

### Layout sketch

```text
─────────────────────────────────────────────
            نمادهای اعتماد
   ┌────┐  ┌────┐  ┌────┐  ┌────┐
   │ENMD│  │EMAL│  │POST│  │ …  │
   └────┘  └────┘  └────┘  └────┘
─────────────────────────────────────────────
        © ۱۴۰۴ گندمک شاپ — …
```

### Files changed

- **created** `src/assets/trust/enamad.jpg`
- **created** `src/assets/trust/emalls.svg`
- **created** `src/assets/trust/post-ir.png`
- **edited** `src/components/Footer.tsx` (add three imports + the trust-seals block)

### Out of scope

- No changes to `Header.tsx`, routing, or other pages.
- The three placeholder seals are intentionally not linked; you can hand me their target URLs later and I'll wire each `<div>` into an `<a>`.
