/**
 * One-time helper: print chat_id of recent messages sent to the bot.
 *
 * Usage on the VPS:
 *   1) In Rubika, open @Gandomakshopbot and send any message (e.g. /start)
 *   2) cd server && RUBIKA_BOT_TOKEN=xxxx node rubika-getchat.js
 *      (or rely on server/.env if you've set RUBIKA_BOT_TOKEN there)
 *   3) Copy the chat_id printed below and put it in server/.env as RUBIKA_CHAT_ID
 */

import "dotenv/config";

const TOKEN = process.env.RUBIKA_BOT_TOKEN;
if (!TOKEN) {
  console.error("RUBIKA_BOT_TOKEN is not set.");
  process.exit(1);
}

try {
  const res = await fetch(`https://botapi.rubika.ir/v3/${TOKEN}/getUpdates`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ limit: 20 }),
  });
  const json = await res.json();
  console.log(JSON.stringify(json, null, 2));

  const updates = json?.data?.updates || json?.updates || [];
  const ids = new Set();
  for (const u of updates) {
    const cid =
      u?.new_message?.chat_id ||
      u?.message?.chat_id ||
      u?.chat_id;
    if (cid) ids.add(cid);
  }
  if (ids.size === 0) {
    console.log("\nNo chat_id found. Send a message to @Gandomakshopbot from Rubika first, then re-run this script.");
  } else {
    console.log("\nFound chat_id(s):");
    for (const id of ids) console.log("  " + id);
    console.log("\nPut the right one into server/.env as RUBIKA_CHAT_ID");
  }
} catch (err) {
  console.error("Request failed:", err);
  process.exit(1);
}
