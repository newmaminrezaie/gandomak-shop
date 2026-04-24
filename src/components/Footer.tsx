import { Phone, MapPin, ShieldCheck, Truck, Sparkles, Mail, Send } from "lucide-react";
import footerLogo from "@/assets/gandomak-footer-logo.png";
import enamadSeal from "@/assets/trust/enamad.jpg";
import emallsSeal from "@/assets/trust/emalls.svg";
import postIrSeal from "@/assets/trust/post-ir.png";

const pillClass =
  "h-20 w-20 rounded-xl bg-background border border-border flex items-center justify-center p-2 hover:shadow-elegant transition-smooth";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          <div className="flex items-center gap-3 rounded-xl bg-background p-3">
            <ShieldCheck className="h-6 w-6 text-accent shrink-0" />
            <div className="text-xs">
              <div className="font-bold">ضمانت اصالت</div>
              <div className="text-muted-foreground">کیفیت تضمین‌شده</div>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-background p-3">
            <Truck className="h-6 w-6 text-accent shrink-0" />
            <div className="text-xs">
              <div className="font-bold">ارسال سریع</div>
              <div className="text-muted-foreground">به سراسر ایران</div>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-background p-3">
            <Sparkles className="h-6 w-6 text-accent shrink-0" />
            <div className="text-xs">
              <div className="font-bold">بسته‌بندی شیک</div>
              <div className="text-muted-foreground">مناسب هدیه</div>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-background p-3">
            <Phone className="h-6 w-6 text-accent shrink-0" />
            <div className="text-xs">
              <div className="font-bold">پشتیبانی</div>
              <div className="text-muted-foreground">پاسخ‌گو هستیم</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
          <div>
            <div className="mb-3">
              <img src={footerLogo} alt="گندمک شاپ" className="h-24 w-auto object-contain" />
            </div>
            <p className="text-muted-foreground leading-7">
              فروشگاه آنلاین زعفران، ادویه، دمنوش و پک هدیه با بسته‌بندی اختصاصی. طعم اصیل ایران را به خانه شما می‌رسانیم.
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-3 text-primary">دسترسی سریع</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="/" className="hover:text-primary transition-smooth">خانه</a></li>
              <li><a href="/#categories" className="hover:text-primary transition-smooth">دسته‌بندی‌ها</a></li>
              <li><a href="/#products" className="hover:text-primary transition-smooth">همه محصولات</a></li>
              <li><a href="/cart" className="hover:text-primary transition-smooth">سبد خرید</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-3 text-primary">ارتباط با ما</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-1 text-accent shrink-0" />
                <span>خراسان رضوی، قائن</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-accent shrink-0" />
                <a href="tel:+989153750234" className="hover:text-primary transition-smooth fa-num" dir="ltr">
                  ۰۹۱۵۳۷۵۰۲۳۴
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-accent shrink-0" />
                <a href="mailto:Info@gandomakshop.ir" className="hover:text-primary transition-smooth" dir="ltr">
                  Info@gandomakshop.ir
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Send className="h-4 w-4 text-accent shrink-0" />
                <a
                  href="https://eitaa.com/gandomakshopir"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-primary transition-smooth"
                  dir="ltr"
                >
                  @gandomakshopir
                </a>
                <span className="text-xs">(ایتا)</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border">
          <div className="text-xs text-muted-foreground text-center mb-3">نمادهای اعتماد</div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              referrerPolicy="origin"
              target="_blank"
              rel="noreferrer"
              href="https://trustseal.enamad.ir/?id=655583&Code=i679RnaSXE7EUpN1xFeht0NynDKCAwub"
              className={pillClass}
              aria-label="نماد اعتماد الکترونیکی"
            >
              <img
                src={enamadSeal}
                alt="نماد اعتماد الکترونیکی"
                referrerPolicy="origin"
                data-enamad-code="i679RnaSXE7EUpN1xFeht0NynDKCAwub"
                className="max-h-full max-w-full object-contain"
              />
            </a>
            <div className={pillClass} aria-label="ای‌مالز">
              <img src={emallsSeal} alt="ای‌مالز" className="max-h-full max-w-full object-contain" />
            </div>
            <div className={pillClass} aria-label="پست جمهوری اسلامی ایران">
              <img src={postIrSeal} alt="پست جمهوری اسلامی ایران" className="max-h-full max-w-full object-contain" />
            </div>
            <div
              className="h-20 w-20 rounded-xl bg-muted border border-border flex items-center justify-center text-muted-foreground text-lg"
              aria-label="نماد آینده"
            >
              …
            </div>
          </div>
          <div className="mt-6 text-center text-xs text-muted-foreground">
            © ۱۴۰۴ گندمک شاپ — تمامی حقوق محفوظ است.
          </div>
        </div>
      </div>
    </footer>
  );
}
