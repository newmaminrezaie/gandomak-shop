import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, ShieldCheck, Copy, CreditCard, Wallet, Truck, Check } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/lib/cart";
import { formatToman } from "@/data/products";
import { Seo } from "@/lib/seo";
import { toast } from "sonner";

const CARD_NUMBER = "6063731055805767";
const CARD_HOLDER = "یاسر شمسی";
const CARD_NUMBER_DISPLAY = CARD_NUMBER.replace(/(\d{4})(?=\d)/g, "$1 ");
const PACKAGING_FEE = 30000;

type PaymentMethod = "card" | "zibal";
type ShippingMethod = "post_cod";

export default function CartPage() {
  const { detailed, totalPrice, totalCount, setQty, remove, clear } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [shipping, setShipping] = useState<ShippingMethod>("post_cod");
  const payable = totalPrice + PACKAGING_FEE;
  const [form, setForm] = useState({
    name: "",
    phone: "",
    province: "",
    city: "",
    address: "",
    postalCode: "",
    notes: "",
    cardRef: "",
    paidAt: "",
  });
  const navigate = useNavigate();

  const update = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const copyCard = async () => {
    try {
      await navigator.clipboard.writeText(CARD_NUMBER);
      toast.success("شماره کارت کپی شد");
    } catch {
      toast.error("کپی نشد. لطفاً دستی کپی کنید.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (detailed.length === 0) return;
    if (!form.name || !form.phone || !form.address) {
      toast.error("لطفاً نام، شماره تماس و آدرس را وارد کنید.");
      return;
    }

    if (method === "card" && form.cardRef.trim().length < 4) {
      toast.error("کد پیگیری واریز را وارد کنید (حداقل ۴ رقم).");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            name: form.name,
            phone: form.phone,
            province: form.province,
            city: form.city,
            address: form.address,
            postalCode: form.postalCode,
            notes: form.notes,
          },
          items: detailed.map((d) => ({ id: d.product.id, name: d.product.name, qty: d.qty })),
          paymentMethod: method,
          shippingMethod: shipping,
          packagingFee: PACKAGING_FEE,
          ...(method === "card"
            ? { cardRef: form.cardRef.trim(), paidAt: form.paidAt.trim() }
            : {}),
        }),
      });
      if (!res.ok) throw new Error("order_failed");
      const data = (await res.json()) as {
        ok?: boolean;
        orderId?: string;
        refId?: string;
        paymentUrl?: string;
        trackId?: string;
      };

      if (method === "zibal") {
        if (!data.paymentUrl) throw new Error("no_payment_url");
        // Don't clear cart yet — only clear after successful verify on /payment/success
        window.location.href = data.paymentUrl;
        return;
      }

      clear();
      const params = new URLSearchParams({ method: "card" });
      if (data.orderId) params.set("orderId", data.orderId);
      if (data.refId) params.set("refId", data.refId);
      navigate(`/payment/callback?${params.toString()}`);
    } catch {
      toast.error("ثبت سفارش انجام نشد. در حالت توسعه طبیعی است؛ بک‌اند را روی VPS اجرا کنید.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Seo title="سبد خرید | گندمک شاپ" description="مشاهده و تکمیل سفارش از فروشگاه گندمک شاپ." canonical="https://gandomakshop.ir/cart" />
      <Header />
      <main className="flex-1 mx-auto max-w-6xl w-full px-4 pt-6">
        <h1 className="text-2xl font-extrabold text-primary mb-6">سبد خرید</h1>

        {detailed.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-border">
            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-5">سبد خرید شما خالی است.</p>
            <Link to="/" className="inline-flex items-center gap-2 rounded-full gradient-primary text-primary-foreground font-bold h-11 px-6 shadow-elegant">
              مشاهده محصولات
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Items */}
            <div className="lg:col-span-2 space-y-3">
              {detailed.map(({ product, qty }) => (
                <div key={product.id} className="flex items-center gap-3 bg-card rounded-2xl p-3 border border-border">
                  <Link to={`/product/${product.slug}`} className="shrink-0">
                    <img src={product.images[0]} alt={product.name} className="h-20 w-20 object-cover rounded-xl" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${product.slug}`} className="font-bold text-sm hover:text-primary line-clamp-2">{product.name}</Link>
                    <div className="text-xs text-muted-foreground mt-1">{product.weight}</div>
                    <div className="font-extrabold text-primary text-sm mt-1 fa-num">
                      {product.price === 0 ? "تماس بگیرید" : formatToman(product.price * qty)}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center bg-background border border-border rounded-full overflow-hidden">
                      <button onClick={() => setQty(product.id, qty + 1)} className="px-2 h-8" aria-label="افزایش"><Plus className="h-3.5 w-3.5" /></button>
                      <span className="px-2 text-sm font-bold fa-num min-w-[28px] text-center">{new Intl.NumberFormat("fa-IR").format(qty)}</span>
                      <button onClick={() => setQty(product.id, qty - 1)} className="px-2 h-8" aria-label="کاهش"><Minus className="h-3.5 w-3.5" /></button>
                    </div>
                    <button onClick={() => remove(product.id)} className="text-destructive text-xs flex items-center gap-1 hover:underline">
                      <Trash2 className="h-3.5 w-3.5" /> حذف
                    </button>
                  </div>
                </div>
              ))}
              <button onClick={clear} className="text-xs text-muted-foreground hover:text-destructive">پاک کردن سبد</button>
            </div>

            {/* Checkout summary + form */}
            <aside className="lg:col-span-1">
              <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-5 border border-border space-y-4 sticky top-20">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">تعداد اقلام</span>
                  <span className="font-bold fa-num">{new Intl.NumberFormat("fa-IR").format(totalCount)}</span>
                </div>
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <span className="text-muted-foreground">مبلغ کل</span>
                  <span className="font-extrabold text-primary text-lg fa-num">{formatToman(totalPrice)}</span>
                </div>

                <div className="space-y-2.5">
                  <Field label="نام و نام خانوادگی *" v={form.name} on={(v) => update("name", v)} />
                  <Field label="شماره موبایل *" v={form.phone} on={(v) => update("phone", v)} type="tel" />
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="استان" v={form.province} on={(v) => update("province", v)} />
                    <Field label="شهر" v={form.city} on={(v) => update("city", v)} />
                  </div>
                  <Field label="آدرس کامل *" v={form.address} on={(v) => update("address", v)} textarea />
                  <Field label="کد پستی" v={form.postalCode} on={(v) => update("postalCode", v)} />
                  <Field label="توضیحات" v={form.notes} on={(v) => update("notes", v)} textarea />
                </div>

                {/* Payment method picker */}
                <div className="pt-2">
                  <div className="text-xs text-muted-foreground mb-2">روش پرداخت</div>
                  <div className="grid grid-cols-2 gap-2">
                    <MethodPill
                      active={method === "card"}
                      onClick={() => setMethod("card")}
                      icon={<CreditCard className="h-4 w-4" />}
                      label="کارت‌به‌کارت"
                    />
                    <MethodPill
                      active={method === "zibal"}
                      onClick={() => setMethod("zibal")}
                      icon={<Wallet className="h-4 w-4" />}
                      label="درگاه زیبال"
                    />
                  </div>
                </div>

                {method === "card" && (
                  <div className="rounded-xl border border-border bg-background p-3 space-y-3">
                    <div className="text-xs text-muted-foreground leading-6">
                      مبلغ کل سفارش را به کارت زیر واریز کنید، سپس کد پیگیری ۴ رقمی تراکنش را وارد نمایید.
                    </div>
                    <div className="rounded-lg bg-card border border-border p-3 space-y-1.5">
                      <div className="text-[11px] text-muted-foreground">شماره کارت</div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-extrabold tracking-widest fa-num text-sm sm:text-base" dir="ltr">
                          {CARD_NUMBER_DISPLAY}
                        </div>
                        <button
                          type="button"
                          onClick={copyCard}
                          className="shrink-0 inline-flex items-center gap-1 text-xs rounded-full bg-secondary text-secondary-foreground h-8 px-3 hover:opacity-90 transition-smooth"
                        >
                          <Copy className="h-3.5 w-3.5" /> کپی
                        </button>
                      </div>
                      <div className="text-[11px] text-muted-foreground pt-1">به نام</div>
                      <div className="text-sm font-bold">{CARD_HOLDER}</div>
                    </div>
                    <Field label="کد پیگیری واریز *" v={form.cardRef} on={(v) => update("cardRef", v)} />
                    <Field label="ساعت/تاریخ واریز (اختیاری)" v={form.paidAt} on={(v) => update("paidAt", v)} />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-12 rounded-full gradient-primary text-primary-foreground font-bold shadow-elegant transition-smooth hover:opacity-95 disabled:opacity-60"
                >
                  {submitting
                    ? "در حال ثبت…"
                    : method === "card"
                    ? "ثبت سفارش (کارت‌به‌کارت)"
                    : "پرداخت با زیبال"}
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground text-center">
                  <ShieldCheck className="h-3.5 w-3.5 text-accent shrink-0" />
                  {method === "card"
                    ? "ثبت سفارش پس از واریز و ارسال کد پیگیری"
                    : "انتقال امن به درگاه پرداخت زیبال"}
                </div>
              </form>
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function MethodPill({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "flex items-center justify-center gap-2 h-11 rounded-xl border text-sm font-bold transition-smooth " +
        (active
          ? "border-primary bg-primary/5 text-primary ring-2 ring-primary/30"
          : "border-border bg-background text-muted-foreground hover:text-foreground")
      }
      aria-pressed={active}
    >
      {icon}
      {label}
    </button>
  );
}

function Field({
  label,
  v,
  on,
  type = "text",
  textarea = false,
}: {
  label: string;
  v: string;
  on: (v: string) => void;
  type?: string;
  textarea?: boolean;
}) {
  const cn =
    "w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-smooth";
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground mb-1 block">{label}</span>
      {textarea ? (
        <textarea value={v} onChange={(e) => on(e.target.value)} rows={2} className={cn} />
      ) : (
        <input type={type} value={v} onChange={(e) => on(e.target.value)} className={cn} />
      )}
    </label>
  );
}
