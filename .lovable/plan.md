## Update Footer Contact Details

Replace the placeholder contact rows in `src/components/Footer.tsx` with the real ones, and swap Instagram for an Eitaa (ایتا) channel link.

### Changes — `src/components/Footer.tsx`

1. **Imports**: drop `Instagram`, add `Mail` and `Send` (used as the Eitaa icon — Lucide has no Eitaa-specific glyph, `Send` reads as a messenger).

2. **"ارتباط با ما" list** — replace all three rows:
   - **Address** — `MapPin` + `خراسان رضوی، قائن`
   - **Phone** — `Phone` + `۰۹۱۵۳۷۵۰۲۳۴` (Persian digits, `dir="ltr"`, `fa-num`), linked as `tel:+989153750234`
   - **Email** — `Mail` + `Info@gandomakshop.ir` (`dir="ltr"`), linked as `mailto:Info@gandomakshop.ir`
     - Note: your message wrote `Info@gandomakshop` without a TLD; assuming `.ir` to match the existing `gandomakshop.ir` domain. If it's a different TLD, tell me and I'll change it.
   - **Eitaa channel** — `Send` icon + `@gandomakshopir` (`dir="ltr"`) with a small "(ایتا)" tag, linked to `https://eitaa.com/gandomakshopir`, `target="_blank" rel="noreferrer"`.

### Files changed
- **edited** `src/components/Footer.tsx`
