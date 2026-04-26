## Add packaging fee + shipping method selector

Flat **۳۰٬۰۰۰ تومان packaging fee** (هزینه بسته‌بندی) added to every order, plus a shipping-method picker with one option for now: **پس‌کرایه شرکت ملی پست**.

### 1. `src/pages/CartPage.tsx`
- Add constant `PACKAGING_FEE = 30000`.
- Add state `shipping: "post_cod"` (only option for now) — kept as state so we can extend later.
- New section above the payment-method picker titled **روش پست**, rendered as a single selected pill:
  - Label: **پس‌کرایه شرکت ملی پست**
  - Sublabel: **پرداخت هزینه ارسال هنگام تحویل**
- Order summary updates:
  - Show `جمع اقلام` (subtotal) = `totalPrice`
  - New row `هزینه بسته‌بندی` = `۳۰٬۰۰۰ تومان`
  - New row `هزینه ارسال` = **پس‌کرایه (هنگام تحویل)** (no number)
  - `مبلغ قابل پرداخت` = `totalPrice + 30000` (shown in primary color/large)
- Submit body sends `shippingMethod: "post_cod"` and `packagingFee: 30000` to `/api/order` (informational — server recomputes).

### 2. `server/index.js`
- Add `const PACKAGING_FEE = 30000;` (toman).
- In `/api/order` after computing `total` from items:
  - `const subtotal = total;`
  - `total = subtotal + PACKAGING_FEE;`
  - `const totalRial = total * 10;`
- Validate `shippingMethod` — accept only `"post_cod"` (default to it if missing).
- Persist new fields on the order: `subtotal_toman`, `packaging_fee`, `shipping_method` (alongside existing `total_toman` which now includes packaging).
- Zibal `amount` uses the new `totalRial` so the buyer pays subtotal + 30k.

### 3. `server/telegram.js`
- In the paid-order message, add lines before the total:
  - `📦 هزینه بسته‌بندی: ۳۰٬۰۰۰ تومان`
  - `🚚 ارسال: پس‌کرایه شرکت ملی پست (هنگام تحویل)`
- Keep `جمع کل` showing `order.total_toman` (which now includes packaging).

### Notes
- Card-to-card branch: customer is instructed (existing copy) to pay "مبلغ کل سفارش" — that figure shown in UI now includes the 30k, so they transfer subtotal + 30k. No copy change needed beyond the summary numbers.
- Postal cost itself is paid to the courier on delivery (پس‌کرایه), so it is NOT added to the online total — only the 30k packaging fee is.

### Files touched
- `src/pages/CartPage.tsx` — edit
- `server/index.js` — edit
- `server/telegram.js` — edit
