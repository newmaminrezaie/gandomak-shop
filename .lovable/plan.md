# Add Rubika notifications for paid orders

Send an instant message to the Rubika bot **@Gandomakshopbot** whenever an order becomes "paid" — both Zibal gateway payments and card-to-card payments (currently `awaiting_review`). This runs in parallel with the existing Telegram notifier; neither replaces the other.

## What we need from you

The bot token alone is not enough — Rubika needs a **chat_id** (the recipient). Please:

1. Open Rubika, search for **@Gandomakshopbot**, and send it any message (e.g. `/start`).
2. We'll add a small one-time script (`server/rubika-getchat.js`) you run on the VPS to read incoming updates and print the chat_id.
3. Paste that chat_id into `server/.env` as `RUBIKA_CHAT_ID`.

If you already know the chat_id (group or personal), share it and we skip step 2.

## Changes

### 1. `server/rubika.js` (new)
Mirror of `server/telegram.js`. Exports `notifyPaidOrderRubika(order)`. Reads `RUBIKA_BOT_TOKEN` and `RUBIKA_CHAT_ID` from env; no-op if missing. Posts to:
```
POST https://botapi.rubika.ir/v3/{RUBIKA_BOT_TOKEN}/sendMessage
body: { chat_id, text }
```
Same Persian message format as Telegram (customer, phone, address, items, totals, shipping, payment method, ref number). Rubika's `sendMessage` does not support HTML — plain text only, no `<b>`/`<code>` tags.

### 2. `server/rubika-getchat.js` (new, one-time helper)
Calls `getUpdates` and prints `chat_id` of any incoming message. Run once after messaging the bot.

### 3. `server/index.js` (edit)
- Import `notifyPaidOrderRubika` from `./rubika.js`.
- **Zibal branch** (`/payment/callback`, after successful verify): fire alongside `notifyPaidOrder` (Telegram).
- **Card-to-card branch** (`/api/order` with `paymentMethod === "card"`): currently no Telegram notification is sent — add Rubika notification immediately on submit (status `awaiting_review`), and optionally Telegram too if you want symmetry. Confirm in next message.

### 4. `server/.env.example` (edit)
Add:
```
RUBIKA_BOT_TOKEN=BGAAAC0IZRGLZKQZIFPKRSOIWQPUKDHPMTXXFGDNNPUDNMTPHXSVGGRPOGZRDRLK
RUBIKA_CHAT_ID=
```
Reminder: real values go only in `server/.env` on the VPS, not committed.

## Out of scope

- No frontend changes.
- No webhook / two-way bot (notifications are outbound only — same as current Telegram setup).
- No changes to Zibal, DB schema, or order flow.

## Open question

For **card-to-card** orders (status `awaiting_review`, paid off-platform, you verify manually) — do you want the Rubika alert:
- (a) immediately when the customer submits the order with their card ref, or
- (b) only after you mark it `paid` in the admin panel?

Today there's no admin "mark as paid" action, so (a) is the practical choice unless you also want me to add that admin action.
