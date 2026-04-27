import { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCart } from "@/lib/cart";
import { formatToman } from "@/data/products";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function MiniCart({ open, onOpenChange }: Props) {
  const { detailed, totalCount, totalPrice, setQty, remove } = useCart();
  const { pathname } = useLocation();
  const prevCountRef = useRef<number>(totalCount);

  // Auto-open when an item is added (count increases) — except on /cart
  useEffect(() => {
    if (pathname === "/cart") {
      prevCountRef.current = totalCount;
      return;
    }
    if (totalCount > prevCountRef.current) {
      onOpenChange(true);
    }
    prevCountRef.current = totalCount;
  }, [totalCount, pathname, onOpenChange]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 flex flex-col"
      >
        <SheetHeader className="px-5 pt-5 pb-3 border-b border-border text-right">
          <SheetTitle className="flex items-center gap-2 text-base font-extrabold text-primary">
            <ShoppingBag className="h-5 w-5" />
            سبد خرید
            {totalCount > 0 && (
              <span className="fa-num inline-flex items-center justify-center min-w-[22px] h-[22px] rounded-full bg-accent text-accent-foreground text-[11px] font-bold px-1.5">
                {new Intl.NumberFormat("fa-IR").format(totalCount)}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {detailed.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <ShoppingBag className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-5">سبد خرید شما خالی است.</p>
            <button
              onClick={() => onOpenChange(false)}
              className="inline-flex items-center gap-2 rounded-full gradient-primary text-primary-foreground font-bold h-11 px-6 shadow-elegant"
            >
              ادامه خرید
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {detailed.map(({ product, qty }) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 bg-card rounded-2xl p-3 border border-border"
                >
                  <Link
                    to={`/product/${product.slug}`}
                    onClick={() => onOpenChange(false)}
                    className="shrink-0"
                  >
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-16 w-16 object-cover rounded-xl"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/product/${product.slug}`}
                      onClick={() => onOpenChange(false)}
                      className="font-bold text-sm hover:text-primary line-clamp-2"
                    >
                      {product.name}
                    </Link>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      {product.weight}
                    </div>
                    <div className="font-extrabold text-primary text-sm mt-1 fa-num">
                      {product.price === 0
                        ? "تماس بگیرید"
                        : formatToman(product.price * qty)}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center bg-background border border-border rounded-full overflow-hidden">
                      <button
                        onClick={() => setQty(product.id, qty + 1)}
                        className="px-2 h-8"
                        aria-label="افزایش"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                      <span className="px-2 text-sm font-bold fa-num min-w-[24px] text-center">
                        {new Intl.NumberFormat("fa-IR").format(qty)}
                      </span>
                      <button
                        onClick={() => setQty(product.id, qty - 1)}
                        className="px-2 h-8"
                        aria-label="کاهش"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button
                      onClick={() => remove(product.id)}
                      className="text-destructive text-[11px] flex items-center gap-1 hover:underline"
                      aria-label="حذف"
                    >
                      <Trash2 className="h-3 w-3" /> حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border p-4 space-y-3 bg-background">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">جمع اقلام</span>
                <span className="font-extrabold text-primary text-base fa-num">
                  {formatToman(totalPrice)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onOpenChange(false)}
                  className="h-11 rounded-full border border-border bg-background text-foreground text-sm font-bold hover:bg-secondary transition-smooth"
                >
                  ادامه خرید
                </button>
                <Link
                  to="/cart"
                  onClick={() => onOpenChange(false)}
                  className="inline-flex items-center justify-center gap-1.5 h-11 rounded-full gradient-primary text-primary-foreground text-sm font-bold shadow-elegant hover:opacity-95 transition-smooth"
                >
                  تکمیل خرید
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
