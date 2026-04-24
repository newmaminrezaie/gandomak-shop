## Fix Enamad Link to Show Shop Owner Details

**Problem:** Clicking the Enamad seal opens `trustseal.enamad.ir` as a normal new tab, which shows a generic page instead of the shop's verified owner details.

**Cause:** Enamad's verification page only renders the shop details when opened in a **sized popup window** with the proper referer — that's what the official `<a onclick="Display(this)">` snippet does. A normal `target="_blank"` anchor doesn't trigger it.

### Changes

Both Enamad seal links — `src/components/Footer.tsx` and `src/components/EnamadPopup.tsx` — get an `onClick` handler that does:

```js
e.preventDefault();
window.open(
  "https://trustseal.enamad.ir/?id=655583&Code=i679RnaSXE7EUpN1xFeht0NynDKCAwub",
  "Popup",
  "toolbar=no, scrollbars=yes, location=no, statusbar=no, menubar=no, resizable=1, width=450, height=630, top=30"
);
```

The `href` stays so the link still works for middle-click / no-JS / SEO. `referrerPolicy="origin"` and `data-enamad-code` are preserved so Enamad's verification picks it up.

This matches Enamad's official embed code 1:1 and makes the click open the proper shop-details popup.