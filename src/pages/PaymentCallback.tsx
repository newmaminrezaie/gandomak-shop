import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Seo } from "@/lib/seo";
import { useCart } from "@/lib/cart";

type State = "loading" | "success" | "failed";

export default function PaymentCallback() {
  const [params] = useSearchParams();
  const [state, setState] = useState<State>("loading");
  const [refId, setRefId] = useState<string>("");
  const { clear } = useCart();

  useEffect(() => {
    const Authority = params.get("Authority");
    const Status = params.get("Status");
    if (!Authority || Status !== "OK") {
      setState("failed");
      return;
    }
    fetch("/api/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ authority: Authority }),
    })
      .then((r) => r.json())
      .then((d: { ok: boolean; refId?: string }) => {
        if (d.ok) {
          setRefId(d.refId ?? "");
          clear();
          setState("success");
        } else {
          setState("failed");
        }
      })
      .catch(() => setState("failed"));
  }, [params, clear]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Seo title="نتیجه پرداخت | گندمک شاپ" />
      <Header />
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full text-center shadow-elegant">
          {state === "loading" && (
            <>
              <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin mb-3" />
              <p className="text-muted-foreground">در حال بررسی پرداخت…</p>
            </>
          )}
          {state === "success" && (
            <>
              <CheckCircle2 className="h-14 w-14 mx-auto text-[hsl(var(--success))] mb-3" />
              <h1 className="text-xl font-extrabold text-primary mb-2">پرداخت موفق</h1>
              <p className="text-sm text-muted-foreground mb-3">سفارش شما با موفقیت ثبت شد.</p>
              {refId && (
                <p className="text-xs fa-num bg-secondary rounded-lg p-2 mb-4">
                  کد پیگیری: <span className="font-bold">{refId}</span>
                </p>
              )}
              <Link to="/" className="inline-block rounded-full gradient-primary text-primary-foreground font-bold h-11 px-6 leading-[2.75rem]">
                بازگشت به فروشگاه
              </Link>
            </>
          )}
          {state === "failed" && (
            <>
              <XCircle className="h-14 w-14 mx-auto text-destructive mb-3" />
              <h1 className="text-xl font-extrabold text-primary mb-2">پرداخت ناموفق</h1>
              <p className="text-sm text-muted-foreground mb-4">پرداخت تکمیل نشد یا توسط شما لغو شد.</p>
              <Link to="/cart" className="inline-block rounded-full bg-secondary text-secondary-foreground font-bold h-11 px-6 leading-[2.75rem]">
                بازگشت به سبد خرید
              </Link>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
