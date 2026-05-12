## Plan

1. **Replace the active Enamad credentials**
   - Update the Enamad URL constants in `EnamadPopup.tsx` from the current `id=720710` / `Code=wRYn...` to the official values from the snippet:
     - `id=655583`
     - `Code=i679RnaSXE7EUpN1xFeht0NynDKCAwub`

2. **Match the official placement behavior**
   - Ensure the popup anchor uses:
     - `href="https://trustseal.enamad.ir/?id=655583&Code=i679RnaSXE7EUpN1xFeht0NynDKCAwub"`
     - `target="_blank"`
     - `referrerPolicy="origin"`
   - Ensure the image uses:
     - `src="https://trustseal.enamad.ir/logo.aspx?id=655583&Code=i679RnaSXE7EUpN1xFeht0NynDKCAwub"`
     - empty `alt`
     - `style={{ cursor: "pointer" }}`
     - `code="i679RnaSXE7EUpN1xFeht0NynDKCAwub"`

3. **Keep footer seal consistent**
   - Apply the same official ID/code to the footer Enamad seal too, so all Enamad links in the app point to the same specific trust page.

4. **Verify the exact output**
   - Search the codebase after edits to confirm no old Enamad ID/code remains.
   - Confirm both the popup and footer links resolve to the provided official URL.