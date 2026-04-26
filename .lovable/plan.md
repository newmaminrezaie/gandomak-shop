## Telegram notifier — apply credentials

You have your bot token and chat ID:
- `TELEGRAM_BOT_TOKEN=8742586804:AAHty8lsdLHazwlm2nLOchNsNuaNGqtFP-g`
- `TELEGRAM_CHAT_ID=2143781867`

Security note: the token has been shared in chat. After we finish, I recommend revoking it via @BotFather → `/mybots` → your bot → API Token → Revoke, and replacing it on the VPS. The plan still works — just paste the new token instead.

### What I'll change in the codebase

The notifier already reads `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` from environment variables (`server/telegram.js`), so no logic changes are needed. Only documentation/example files need updating so future deploys are clear.

1. **`server/.env.example`** — keep the keys empty (it's a committed template, real secrets must not live here), but add a short comment pointing to the bot username `@Gandomakshopbot` so future you remembers which bot it is.
2. **`DEPLOY.md`** — add a short "Telegram notifications" section with the exact two lines to add to `server/.env` on the VPS, plus the `pm2 restart gandomak-api` step and a one-line test (curl to `sendMessage`) to confirm delivery before relying on it for real orders.

### What you need to do on the VPS (I cannot SSH in)

SSH into the VPS and run:

```bash
cd /path/to/gandomak/server
nano .env
```

Add (or update) these two lines:

```
TELEGRAM_BOT_TOKEN=8742586804:AAHty8lsdLHazwlm2nLOchNsNuaNGqtFP-g
TELEGRAM_CHAT_ID=2143781867
```

Save, then restart and test:

```bash
pm2 restart gandomak-api
pm2 logs gandomak-api --lines 30
```

Quick send-test (should make Telegram ping you):

```bash
curl -s "https://api.telegram.org/bot8742586804:AAHty8lsdLHazwlm2nLOchNsNuaNGqtFP-g/sendMessage" \
  -d chat_id=2143781867 \
  -d text="✅ Gandomak notifier connected"
```

If the curl returns `{"ok":true,...}` and you receive the message, the next paid Zibal order will trigger `notifyPaidOrder` automatically.

### Optional follow-up (not in this plan unless you say yes)

Currently only **Zibal-verified** orders trigger a Telegram message. **Card-to-card "awaiting review"** orders do not. If you want a notification the moment a customer submits a card-to-card order (so you can check your bank app), I can wire `notifyPaidOrder` (or a new `notifyPendingCardOrder`) into that branch in `server/index.js` as well.
