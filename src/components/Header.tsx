import { Link, useLocation } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart";
import wordmark from "@/assets/gandomak-wordmark.svg";

export default function Header() {
  const { totalCount } = useCart();
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-md border-b border-border">
      <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center group" aria-label="گندمک شاپ">
          <img src={wordmark} alt="گندمک شاپ" className="h-8 sm:h-10 object-contain transition-smooth group-hover:scale-105" loading="eager" />
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link to="/" className={pathname === "/" ? "text-primary" : "text-foreground/70 hover:text-primary transition-smooth"}>خانه</Link>
          <a href="/#products" className="text-foreground/70 hover:text-primary transition-smooth">محصولات</a>
          <a href="/#categories" className="text-foreground/70 hover:text-primary transition-smooth">دسته‌بندی‌ها</a>
        </nav>

        <div className="flex flex-col items-center gap-1">
          <Link
            to="/cart"
            className="relative inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 h-11 font-semibold text-sm shadow-soft hover:shadow-elegant transition-smooth"
            aria-label={`سبد خرید (${totalCount} کالا)`}
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">سبد خرید</span>
            {totalCount > 0 && (
              <span className="fa-num inline-flex items-center justify-center min-w-[22px] h-[22px] rounded-full bg-accent text-accent-foreground text-[11px] font-bold px-1.5">
                {new Intl.NumberFormat("fa-IR").format(totalCount)}
              </span>
            )}
          </Link>
          <a
            href="tel:+989153750234"
            dir="ltr"
            className="fa-num text-[11px] sm:text-xs text-muted-foreground hover:text-primary transition-smooth tracking-wider"
            aria-label="تماس: ۰۹۱۵ ۳۷۵ ۰۲۳۴"
          >
            ۰۹۱۵ ۳۷۵ ۰۲۳۴
          </a>
        </div>
      </div>
    </header>
  );
}
