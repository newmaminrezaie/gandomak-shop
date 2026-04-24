import { Link, useLocation } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart";
import logo from "/logo.png";

export default function Header() {
  const { totalCount } = useCart();
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-md border-b border-border">
      <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-2 group" aria-label="گندمک شاپ">
          <img src={logo} alt="لوگوی گندمک شاپ" className="h-11 w-11 object-contain transition-smooth group-hover:scale-105" loading="eager" width={44} height={44} />
          <div className="leading-tight hidden sm:block">
            <div className="font-extrabold text-primary text-lg">گندمک شاپ</div>
            <div className="text-[11px] text-muted-foreground -mt-0.5">طعم اصیل ایران</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link to="/" className={pathname === "/" ? "text-primary" : "text-foreground/70 hover:text-primary transition-smooth"}>خانه</Link>
          <a href="/#products" className="text-foreground/70 hover:text-primary transition-smooth">محصولات</a>
          <a href="/#categories" className="text-foreground/70 hover:text-primary transition-smooth">دسته‌بندی‌ها</a>
        </nav>

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
      </div>
    </header>
  );
}
