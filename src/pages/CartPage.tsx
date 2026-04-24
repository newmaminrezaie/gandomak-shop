import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, ShieldCheck } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/lib/cart";
import { formatToman } from "@/data/products";
import { Seo } from "@/lib/seo";
import { toast } from "sonner";

export default function CartPage() {
  const { detailed, totalPrice, totalCount, setQty, remove, clear } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    province: "",
    city: "",
    address: "",
    postalCode: "",
    notes: "",
  });
  const navigate = useNavigate();

  const update = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (detailed.length === 0) return;
    if (!form.name || !form.phone || !form.address) {
      toast.error("لطفاً نام، شماره تماس و آدرس را وارد کنید.");
      return;
    }
    setSubmitting(true);
    try {
      // Posts to your Express backend (server/) on the same VPS.
      // Backend computes total server-side, calls Zarinpal, returns { paymentUrl }.
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: form,
          items: detailed.map((d) => ({ id: d.product.id, qty: d.qty })),
        }),
      });
      if (!res.ok) throw new Error("order_failed");
      const data = (await res.json()) as { paymentUrl?: string };
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        throw new Error("no_payment_url");
      }
    } catch {
      toast.error("اتصال به درگاه پرداخت برقرار نشد. در حالت توسعه طبیعی است؛ بک‌اند را روی VPS اجرا کنید.");
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

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-12 rounded-full gradient-primary text-primary-foreground font-bold shadow-elegant transition-smooth hover:opacity-95 disabled:opacity-60"
                >
                  {submitting ? "در حال انتقال…" : "پرداخت با زرین‌پال"}
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-accent" />
                  پرداخت امن از طریق درگاه زرین‌پال
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
