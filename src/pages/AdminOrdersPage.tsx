import { useCallback, useEffect, useMemo, useState } from "react";
import {
  RefreshCw,
  LogOut,
  Search,
  Phone,
  Copy,
  WifiOff,
  ShieldCheck,
  Package,
  CreditCard,
  Banknote,
} from "lucide-react";
import {
  AdminOrder,
  OrderStatus,
  clearAdminToken,
  fetchOrders,
  getAdminToken,
  setAdminToken,
} from "@/lib/adminApi";
import { formatToman } from "@/data/products";
import { Seo } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "در انتظار پرداخت",
  paid: "پرداخت‌شده",
  failed: "ناموفق",
  awaiting_review: "در انتظار بررسی",
};

const STATUS_CLASS: Record<OrderStatus, string> = {
  paid: "bg-primary/15 text-primary border-primary/30",
  pending: "bg-muted text-muted-foreground border-border",
  awaiting_review: "bg-accent/20 text-accent-foreground border-accent/40",
  failed: "bg-destructive/15 text-destructive border-destructive/30",
};

const STATUS_TABS: { key: "all" | OrderStatus; label: string }[] = [
  { key: "all", label: "همه" },
  { key: "paid", label: "پرداخت‌شده" },
  { key: "awaiting_review", label: "بررسی" },
  { key: "pending", label: "در انتظار" },
  { key: "failed", label: "ناموفق" },
];

const fmtDate = (iso?: string | null) => {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
};

function copy(text: string, label: string) {
  navigator.clipboard?.writeText(text).then(
    () => toast.success(`${label} کپی شد`),
    () => toast.error("کپی ناموفق بود")
  );
}

// ───────────────────── Token gate ─────────────────────
function TokenGate({ onSubmit }: { onSubmit: (t: string) => void }) {
  const [val, setVal] = useState("");
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-6 shadow-elegant">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-extrabold text-primary">پنل سفارش‌ها</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          برای مشاهدهٔ سفارش‌ها، توکن ادمین را وارد کنید.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const v = val.trim();
            if (!v) return;
            onSubmit(v);
          }}
          className="space-y-3"
          dir="ltr"
        >
          <Input
            type="password"
            placeholder="ADMIN_TOKEN"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            autoFocus
            className="font-mono"
          />
          <Button type="submit" className="w-full">
            ورود
          </Button>
        </form>
      </div>
    </div>
  );
}

// ───────────────────── Page ─────────────────────
export default function AdminOrdersPage() {
  const [token, setToken] = useState<string | null>(() => getAdminToken());
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<AdminOrder | null>(null);
  const [online, setOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    const res = await fetchOrders(token);
    setLoading(false);
    if (res.ok === false) {
      setError(res.error);
      if (res.status === 401) {
        clearAdminToken();
        setToken(null);
      }
      return;
    }
    setOrders(res.orders);
    setFetchedAt(res.fetchedAt);
  }, [token]);

  useEffect(() => {
    if (!token) return;
    load();
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible" && navigator.onLine) load();
    }, 30000);
    return () => window.clearInterval(id);
  }, [token, load]);

  // Online/offline listeners
  useEffect(() => {
    const on = () => {
      setOnline(true);
      load();
    };
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (filter !== "all" && o.status !== filter) return false;
      if (!q) return true;
      return (
        o.id.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q) ||
        o.customer_phone.toLowerCase().includes(q) ||
        (o.ref_number ?? "").toLowerCase().includes(q) ||
        (o.track_id ?? "").toLowerCase().includes(q)
      );
    });
  }, [orders, filter, query]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: orders.length };
    for (const o of orders) c[o.status] = (c[o.status] ?? 0) + 1;
    return c;
  }, [orders]);

  const handleLogout = () => {
    clearAdminToken();
    setToken(null);
    setOrders([]);
  };

  if (!token) {
    return (
      <>
        <Seo title="پنل سفارش‌ها | گندمک شاپ" canonical="https://gandomakshop.ir/admin/orders" />
        <TokenGate
          onSubmit={(t) => {
            setAdminToken(t);
            setToken(t);
          }}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Seo title="پنل سفارش‌ها | گندمک شاپ" canonical="https://gandomakshop.ir/admin/orders" />

      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <h1 className="font-extrabold text-primary text-lg">سفارش‌ها</h1>
            <span className="fa-num text-xs text-muted-foreground">
              ({new Intl.NumberFormat("fa-IR").format(orders.length)})
            </span>
          </div>

          <div className="flex-1" />

          {!online && (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <WifiOff className="h-3.5 w-3.5" />
              آفلاین
            </span>
          )}
          {fetchedAt && (
            <span className="text-xs text-muted-foreground hidden sm:inline">
              آخرین بروزرسانی: {fmtDate(fetchedAt)}
            </span>
          )}

          <Button size="sm" variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ml-1 ${loading ? "animate-spin" : ""}`} />
            تازه‌سازی
          </Button>
          <Button size="sm" variant="ghost" onClick={handleLogout}>
            <LogOut className="h-4 w-4 ml-1" />
            خروج
          </Button>
        </div>

        {/* Filters */}
        <div className="mx-auto max-w-6xl px-4 pb-3 flex flex-col sm:flex-row gap-3">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <TabsList>
              {STATUS_TABS.map((t) => (
                <TabsTrigger key={t.key} value={t.key} className="text-xs sm:text-sm">
                  {t.label}
                  <span className="fa-num mr-1 text-muted-foreground">
                    ({new Intl.NumberFormat("fa-IR").format(counts[t.key] ?? 0)})
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="relative flex-1 max-w-sm">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="نام، موبایل، کد سفارش، رهگیری..."
              className="pr-9"
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-4">
        {error && (
          <div className="mb-3 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-sm px-3 py-2">
            {error}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            {loading ? "در حال بارگذاری..." : "سفارشی یافت نشد."}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block bg-card border border-border rounded-xl overflow-hidden shadow-soft">
              <table className="w-full text-sm">
                <thead className="bg-secondary text-muted-foreground text-xs">
                  <tr>
                    <th className="text-right px-3 py-2 font-medium">کد</th>
                    <th className="text-right px-3 py-2 font-medium">مشتری</th>
                    <th className="text-right px-3 py-2 font-medium">موبایل</th>
                    <th className="text-right px-3 py-2 font-medium">مبلغ</th>
                    <th className="text-right px-3 py-2 font-medium">روش</th>
                    <th className="text-right px-3 py-2 font-medium">وضعیت</th>
                    <th className="text-right px-3 py-2 font-medium">تاریخ</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((o) => (
                    <tr
                      key={o.id}
                      onClick={() => setSelected(o)}
                      className="border-t border-border hover:bg-secondary/50 cursor-pointer transition-smooth"
                    >
                      <td className="px-3 py-2 font-mono text-xs">{o.id}</td>
                      <td className="px-3 py-2 font-medium">{o.customer_name}</td>
                      <td className="px-3 py-2 fa-num text-muted-foreground">{o.customer_phone}</td>
                      <td className="px-3 py-2 fa-num font-bold">{formatToman(o.total_toman)}</td>
                      <td className="px-3 py-2">
                        <span className="inline-flex items-center gap-1 text-xs">
                          {o.payment_method === "card" ? (
                            <CreditCard className="h-3.5 w-3.5" />
                          ) : (
                            <Banknote className="h-3.5 w-3.5" />
                          )}
                          {o.payment_method === "card" ? "کارت‌به‌کارت" : "زیبال"}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-block text-xs px-2 py-0.5 rounded-full border ${STATUS_CLASS[o.status]}`}
                        >
                          {STATUS_LABEL[o.status] ?? o.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-xs text-muted-foreground fa-num">
                        {fmtDate(o.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-2">
              {filtered.map((o) => (
                <button
                  key={o.id}
                  onClick={() => setSelected(o)}
                  className="w-full text-right bg-card border border-border rounded-xl p-3 shadow-soft active:scale-[0.99] transition-smooth"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-bold truncate">{o.customer_name}</div>
                      <div className="text-xs text-muted-foreground fa-num">
                        {o.customer_phone}
                      </div>
                    </div>
                    <span
                      className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full border ${STATUS_CLASS[o.status]}`}
                    >
                      {STATUS_LABEL[o.status] ?? o.status}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="font-mono text-muted-foreground">{o.id}</span>
                    <span className="fa-num font-bold text-primary">
                      {formatToman(o.total_toman)}
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] text-muted-foreground fa-num">
                    {fmtDate(o.created_at)}
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Detail drawer */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent side="left" className="w-full sm:max-w-lg overflow-y-auto" dir="rtl">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="text-right">
                  جزئیات سفارش
                  <span className="block text-xs font-normal font-mono text-muted-foreground mt-1">
                    {selected.id}
                  </span>
                </SheetTitle>
              </SheetHeader>

              <div className="mt-4 space-y-5 text-sm">
                {/* Status row */}
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-block text-xs px-2 py-1 rounded-full border ${STATUS_CLASS[selected.status]}`}
                  >
                    {STATUS_LABEL[selected.status] ?? selected.status}
                  </span>
                  <span className="text-xs text-muted-foreground fa-num">
                    {fmtDate(selected.created_at)}
                  </span>
                </div>

                {/* Customer */}
                <section className="bg-secondary/50 rounded-lg p-3 space-y-2">
                  <h3 className="font-bold text-primary text-xs uppercase tracking-wide">
                    مشتری
                  </h3>
                  <div className="font-medium">{selected.customer_name}</div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="fa-num text-muted-foreground">
                      {selected.customer_phone}
                    </span>
                    <div className="flex gap-1">
                      <a href={`tel:${selected.customer_phone}`}>
                        <Button size="sm" variant="outline">
                          <Phone className="h-3.5 w-3.5 ml-1" />
                          تماس
                        </Button>
                      </a>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copy(selected.customer_phone, "موبایل")}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-start justify-between gap-2 pt-1 border-t border-border">
                    <p className="text-foreground/90 leading-6 flex-1">
                      {selected.customer_address}
                      {selected.customer_postalcode && (
                        <span className="block text-xs text-muted-foreground fa-num mt-1">
                          کدپستی: {selected.customer_postalcode}
                        </span>
                      )}
                    </p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        copy(
                          `${selected.customer_address}${
                            selected.customer_postalcode
                              ? ` — کدپستی ${selected.customer_postalcode}`
                              : ""
                          }`,
                          "آدرس"
                        )
                      }
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </section>

                {/* Payment */}
                <section className="bg-secondary/50 rounded-lg p-3 space-y-1.5">
                  <h3 className="font-bold text-primary text-xs uppercase tracking-wide">
                    پرداخت
                  </h3>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">روش</span>
                    <span>
                      {selected.payment_method === "card" ? "کارت‌به‌کارت" : "درگاه زیبال"}
                    </span>
                  </div>
                  {selected.track_id && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">کد رهگیری</span>
                      <span className="font-mono text-xs">{selected.track_id}</span>
                    </div>
                  )}
                  {selected.ref_number && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">شماره مرجع</span>
                      <span className="font-mono text-xs">{selected.ref_number}</span>
                    </div>
                  )}
                  {selected.card_ref && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">رسید کارت</span>
                      <span className="font-mono text-xs">{selected.card_ref}</span>
                    </div>
                  )}
                  {selected.paid_at && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">پرداخت‌شده در</span>
                      <span className="fa-num text-xs">{fmtDate(selected.paid_at)}</span>
                    </div>
                  )}
                </section>

                {/* Items */}
                <section>
                  <h3 className="font-bold text-primary text-xs uppercase tracking-wide mb-2">
                    اقلام ({new Intl.NumberFormat("fa-IR").format(selected.items.length)})
                  </h3>
                  <div className="border border-border rounded-lg divide-y divide-border">
                    {selected.items.map((it, i) => (
                      <div key={`${it.id}-${i}`} className="flex justify-between gap-2 px-3 py-2">
                        <div className="min-w-0">
                          <div className="font-medium truncate">{it.name}</div>
                          <div className="text-xs text-muted-foreground fa-num">
                            {new Intl.NumberFormat("fa-IR").format(it.qty)} × {formatToman(it.price)}
                          </div>
                        </div>
                        <div className="fa-num font-bold whitespace-nowrap">
                          {formatToman(it.qty * it.price)}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Totals */}
                <section className="space-y-1.5">
                  {typeof selected.subtotal_toman === "number" && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">جمع اقلام</span>
                      <span className="fa-num">{formatToman(selected.subtotal_toman)}</span>
                    </div>
                  )}
                  {typeof selected.packaging_fee === "number" && selected.packaging_fee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">بسته‌بندی</span>
                      <span className="fa-num">{formatToman(selected.packaging_fee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-extrabold text-base pt-2 border-t border-border">
                    <span>مجموع</span>
                    <span className="fa-num text-primary">
                      {formatToman(selected.total_toman)}
                    </span>
                  </div>
                </section>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
