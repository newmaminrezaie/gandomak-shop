## Goal

Make the Enamad seal (popup + footer) open your unique trust page at id `720710` instead of a generic Enamad page.

## Root cause

Enamad's trust page validates incoming clicks against the seal markup it serves. Two things must match their official snippet exactly:

1. The `<img>` must carry a literal `code="wRYn3reyeBtj2jZJ2oZYzZfyeKkh6don"` attribute (we currently use `data-enamad-code`, which Enamad ignores).
2. The image must be loaded from `https://trustseal.enamad.ir/logo.aspx?id=...&Code=...` with `referrerpolicy="origin"` so Enamad's server records the referer and binds the click to your seal.

When either is missing, clicking the seal lands on Enamad's generic "seal not verified / not found" page instead of your unique page.

## Changes

### `src/components/EnamadPopup.tsx`
- Replace `data-enamad-code={ENAMAD_CODE}` on the `<img>` with the literal attribute Enamad expects. In React/TSX this requires either `dangerouslySetInnerHTML` on the wrapping `<a>` or spreading an unknown prop:
  ```tsx
  <img
    src={ENAMAD_LOGO}
    alt=""
    referrerPolicy="origin"
    style={{ cursor: "pointer" }}
    {...({ code: ENAMAD_CODE } as React.ImgHTMLAttributes<HTMLImageElement>)}
    className="block h-24 w-24 sm:h-28 sm:w-28 object-cover"
  />
  ```
- Keep `href={ENAMAD_LINK}`, `target="_blank"`, `rel="noreferrer"` removed in favor of `rel="noopener"` (we must NOT strip the referrer — Enamad needs it). Use `rel="noopener"` only.

### `src/components/Footer.tsx`
- Same `code` attribute fix on the footer `<img>`.
- Remove the `onClick` handler that calls `window.open(...)` — `window.open` with a name strips the referrer in some browsers, which can also break verification. Let the `<a target="_blank">` handle it natively (this also matches Enamad's official snippet).
- Use `rel="noopener"` (not `noreferrer`).

### Note on the `code` attribute and React warning

React will log a dev warning about the unknown DOM attribute `code`. That's expected and harmless — Enamad's verification script reads it from the rendered DOM. The spread-cast pattern above keeps TypeScript happy.

## Out of scope

No styling, layout, or behavior changes beyond the markup needed for Enamad verification.
