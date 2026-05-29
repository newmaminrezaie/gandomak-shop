/**
 * Rubika bot notifier. No-op when credentials are missing.
 * Docs: https://rubika.ir/botapi
 */

const TOKEN = process.env.RUBIKA_BOT_TOKEN || "";
const CHAT_ID = process.env.RUBIKA_CHAT_ID || "";

function fmtToman(n) {
  return new Intl.NumberFormat("fa-IR").format(Number(n) || 0) + " تومان";
}

function buildText(order, { kind }) {
  const items = Array.isArray(order.items) ? order.items : [];
  const lines = items
    .map((it) => `• ${it.name} × ${it.qty} — ${fmtToman(it.price * it.qty)}`)
    .join("\n");

  const header =
    kind === "card"
      ? "🧾 سفارش جدید (کارت‌به‌کارت — در انتظار بررسی)"
      : "✅ سفارش پرداخت‌شده (درگاه بانک ملت)";

  return (
    `${header}\n` +
    `کد سفارش: ${order.id}\n` +
    (order.ref_number ? `کد پیگیری: ${order.ref_number}\n` : "") +
    (order.card_ref ? `شماره پیگیری کارت‌به‌کارت: ${order.card_ref}\n` : "") +
    (order.paid_at && kind === "card" ? `زمان واریز اعلام‌شده: ${order.paid_at}\n` : "") +
    `\n👤 ${order.customer_name}\n` +
    `📞 ${order.customer_phone}\n` +
    `🏠 ${order.customer_address}\n` +
    (order.customer_postalcode ? `📮 ${order.customer_postalcode}\n` : "") +
    `\n🛒 اقلام:\n${lines}\n` +
    (order.subtotal_toman ? `\n🧾 جمع اقلام: ${fmtToman(order.subtotal_toman)}` : "") +
    `\n📦 هزینه بسته‌بندی: ${fmtToman(order.packaging_fee ?? 30000)}` +
    `\n🚚 ارسال: پس‌کرایه شرکت ملی پست (هنگام تحویل)` +
    `\n💰 جمع کل: ${fmtToman(order.total_toman)}`
  );
}

async function sendMessage(text) {
  if (!TOKEN || !CHAT_ID) {
    console.warn("[rubika] RUBIKA_BOT_TOKEN or RUBIKA_CHAT_ID not set — skipping notification");
    return;
  }
  try {
    const res = await fetch(`https://botapi.rubika.ir/v3/${TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: CHAT_ID, text }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error(`[rubika] sendMessage failed [${res.status}]:`, body);
    }
  } catch (err) {
    console.error("[rubika] sendMessage error:", err);
  }
}

export async function notifyPaidOrderRubika(order) {
  await sendMessage(buildText(order, { kind: "zibal" }));
}

export async function notifyCardOrderRubika(order) {
  await sendMessage(buildText(order, { kind: "card" }));
}
