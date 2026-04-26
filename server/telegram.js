/**
 * Telegram notifier. No-op when credentials are missing.
 */

const TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || "";

function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function fmtToman(n) {
  return new Intl.NumberFormat("fa-IR").format(Number(n) || 0) + " تومان";
}

export async function notifyPaidOrder(order) {
  if (!TOKEN || !CHAT_ID) {
    console.warn("[telegram] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set — skipping notification");
    return;
  }

  const items = Array.isArray(order.items) ? order.items : [];
  const lines = items
    .map((it) => `• ${escapeHtml(it.name)} × ${it.qty} — ${fmtToman(it.price * it.qty)}`)
    .join("\n");

  const text =
    `✅ <b>سفارش پرداخت‌شده</b>\n` +
    `کد سفارش: <code>${escapeHtml(order.id)}</code>\n` +
    (order.ref_number ? `کد پیگیری زیبال: <code>${escapeHtml(order.ref_number)}</code>\n` : "") +
    `\n👤 <b>${escapeHtml(order.customer_name)}</b>\n` +
    `📞 ${escapeHtml(order.customer_phone)}\n` +
    `🏠 ${escapeHtml(order.customer_address)}\n` +
    (order.customer_postalcode ? `📮 ${escapeHtml(order.customer_postalcode)}\n` : "") +
    `\n🛒 <b>اقلام:</b>\n${lines}\n` +
    (order.subtotal_toman ? `\n🧾 جمع اقلام: ${fmtToman(order.subtotal_toman)}` : "") +
    `\n📦 هزینه بسته‌بندی: ${fmtToman(order.packaging_fee ?? 30000)}` +
    `\n🚚 ارسال: پس‌کرایه شرکت ملی پست (هنگام تحویل)` +
    `\n💰 <b>جمع کل:</b> ${fmtToman(order.total_toman)}`;

  try {
    const res = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error(`[telegram] sendMessage failed [${res.status}]:`, body);
    }
  } catch (err) {
    console.error("[telegram] sendMessage error:", err);
  }
}
