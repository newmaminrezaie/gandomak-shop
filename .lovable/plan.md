## Add "کارت‌به‌کارت" Payment Option at Checkout (Zibal placeholder for later)

Replace the single "Pay with Zarinpal" button in `src/pages/CartPage.tsx` with a two-option payment selector. Card-to-card is fully functional now; Zibal is wired as a stub that you'll point at real endpoints later.

### Frontend — `src/pages/CartPage.tsx`

1. **New state**: `const [method, setMethod] = useState<"card" | "zibal">("card");` (default to card-to-card so users see the card details immediately).

2. **Payment method picker** (above the submit button, below the customer fields):
   - Two equal radio-style pills using existing tokens (`bg-background`, `border-border`, selected = `border-primary bg-primary/5 ring-2 ring-primary/30`).
   - Labels: **"کارت‌به‌کارت"** and **"درگاه زیبال"**.

3. **Card-to-card panel** (shown when `method === "card"`):
   - Card holder: **سمیرا رشیدی**
   - Card number displayed in 4-group `fa-num` format: **۶۰۶۳ ۷۳۱۰ ۵۵۸۰ ۵۷۶۷** (stored as the raw `6063731055805767`).
   - "کپی شماره کارت" button → `navigator.clipboard.writeText("6063731055805767")` + `toast.success("شماره کارت کپی شد")`.
   - Short instructions (Persian): pay the order total to this card, then enter the 4-digit reference and (optional) timestamp below.
   - Two extra inputs added to `form` state: `cardRef` (required for card method) and `paidAt` (optional Persian date/time text).

4. **Zibal panel** (shown when `method === "zibal"`):
   - Single-line note: «در حال حاضر در حال اتصال به درگاه زیبال هستیم — به‌زودی فعال می‌شود.» Submit stays disabled with a lighter style, OR if you prefer it always submits, we keep it enabled and the backend returns the placeholder error. **Decision in plan: keep button enabled but show a `toast.info` saying the gateway will be wired up once endpoints arrive — no network call is made.**

5. **Submit logic** (`handleSubmit`):
   - Validation: name/phone/address required for both. For `card`, also require `form.cardRef` (min 4 chars).
   - For `card`: POST to **`/api/order`** with `{ customer, items, paymentMethod: "card", cardRef, paidAt }`. On success the backend now returns `{ orderId, refId }` instead of a `paymentUrl`. We `clear()` the cart and `navigate('/payment/callback?method=card&orderId=…')` so the existing success page is reused.
   - For `zibal`: short-circuit — `toast.info("درگاه زیبال هنوز فعال نیست. لطفاً از کارت‌به‌کارت استفاده کنید.")` and do not call the backend.

6. **Submit button label**:
   - card → **"ثبت سفارش (کارت‌به‌کارت)"**
   - zibal → **"پرداخت با زیبال (به‌زودی)"** (disabled visual)

7. **Trust footer line** under the button updates per method: card → "ثبت سفارش پس از واریز و ارسال کد پیگیری"، zibal → "اتصال به درگاه زیبال در حال آماده‌سازی".

### Backend — `server/index.js`

1. Extend `POST /api/order` to branch on `paymentMethod`:
   - **`paymentMethod === "card"`**: skip Zarinpal entirely. Compute the same server-side `total` (existing logic), persist a new order with `status: "awaiting_review"`, `paymentMethod: "card"`, `cardRef`, `paidAt`, then return `{ ok: true, orderId, refId: <short id> }` (no `paymentUrl`).
   - **`paymentMethod === "zibal"`**: return `{ error: "zibal_not_configured" }` with HTTP 501 for now — placeholder until you provide endpoints. (Frontend never calls this branch yet, but keeps the contract honest.)
   - Default / missing → keep existing Zarinpal flow untouched so nothing else regresses.
2. Add the bank card constants near the top so they're easy to update later:
   ```js
   const CARD_NUMBER = "6063731055805767";
   const CARD_HOLDER = "سمیرا رشیدی";
   ```
   These aren't strictly required server-side, but exporting them via a new `GET /api/payment/card` endpoint lets the frontend fetch them from a single source (optional — see below).

3. **Optional but recommended**: add `GET /api/payment/card` returning `{ number, holder }` so updating the card later only touches `.env` / server config. The frontend can fall back to hardcoded values if the call fails. **Plan keeps the values hardcoded in both places for now (simpler), and we can centralize later.**

### Files changed
- **edited** `src/pages/CartPage.tsx` (method selector, card panel, new form fields, branching submit)
- **edited** `server/index.js` (card-to-card branch in `/api/order`, Zibal 501 stub)

### Out of scope (until you share Zibal docs)
- Real Zibal `request` / `verify` calls and callback handling.
- Admin UI to mark card-to-card orders as confirmed (today they land in `orders.json` as `awaiting_review`).
