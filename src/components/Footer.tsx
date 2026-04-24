import { Phone, Instagram, MapPin, ShieldCheck, Truck, Sparkles } from "lucide-react";
import wordmark from "@/assets/gandomak-wordmark.png";

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
              <img src={wordmark} alt="گندمک شاپ" className="h-10 object-contain" />
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
              <li className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-1 text-accent shrink-0" /><span>ایران</span></li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-accent shrink-0" /><a href="tel:+98" className="hover:text-primary transition-smooth fa-num">۰۲۱-۰۰۰۰۰۰۰۰</a></li>
              <li className="flex items-center gap-2"><Instagram className="h-4 w-4 text-accent shrink-0" /><a href="https://instagram.com/" target="_blank" rel="noreferrer" className="hover:text-primary transition-smooth">gandomak.shop@</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border text-center text-xs text-muted-foreground">
          © ۱۴۰۴ گندمک شاپ — تمامی حقوق محفوظ است.
        </div>
      </div>
    </footer>
  );
}
