import { useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Phone, ShoppingCart, Check, Plus, Minus } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { getProductBySlug, formatToman, PRODUCTS } from "@/data/products";
import { useCart } from "@/lib/cart";
import { Seo } from "@/lib/seo";
import { toast } from "sonner";

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const product = slug ? getProductBySlug(slug) : undefined;
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const { add } = useCart();
  const navigate = useNavigate();

  const related = useMemo(() => {
    if (!product) return [];
    return PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center p-8 text-center">
          <div>
            <p className="mb-4 text-muted-foreground">محصول یافت نشد.</p>
            <Link to="/" className="text-primary font-bold underline">بازگشت به فروشگاه</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isContact = product.price === 0;

  const handleAdd = () => {
    add(product.id, qty);
    toast.success("به سبد خرید اضافه شد", {
      action: { label: "مشاهده سبد", onClick: () => navigate("/cart") },
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background pb-24 md:pb-0">
      <Seo
        title={`${product.name} | گندمک شاپ`}
        description={product.shortDescription ?? product.description ?? product.name}
        canonical={`https://gandomakshop.ir/product/${product.slug}`}
        image={`https://gandomakshop.ir${product.images[0]}`}
        type="product"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          image: product.images.map((i) => `https://gandomakshop.ir${i}`),
          description: product.description ?? product.shortDescription,
          brand: { "@type": "Brand", name: "گندمک" },
          category: product.category,
          offers: {
            "@type": "Offer",
            priceCurrency: "IRR",
            price: product.price,
            availability: isContact ? "https://schema.org/InStock" : "https://schema.org/InStock",
            url: `https://gandomakshop.ir/product/${product.slug}`,
          },
        }}
      />
      <Header />
      <main className="flex-1 mx-auto max-w-6xl w-full px-4 pt-4">
        <nav className="text-xs text-muted-foreground mb-4 flex items-center gap-1">
          <Link to="/" className="hover:text-primary">خانه</Link>
          <ChevronLeft className="h-3 w-3" />
          <span>{product.category}</span>
          <ChevronLeft className="h-3 w-3" />
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-10">
          {/* Gallery */}
          <div>
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-secondary shadow-soft border border-border">
              <img
                src={product.images[activeImg]}
                alt={product.name}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><rect fill='%23f1ead8' width='200' height='200'/><text x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%230E4A36' font-family='Vazirmatn,sans-serif' font-size='14'>گندمک</text></svg>";
                }}
                className="h-full w-full object-cover"
              />
              {product.badge && (
                <span className="absolute top-3 right-3 bg-accent text-accent-foreground text-xs font-bold rounded-full px-3 py-1 shadow-soft">
                  {product.badge}
                </span>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="mt-3 grid grid-cols-5 gap-2">
                {product.images.map((img, i) => (
                  <button
                    key={img}
                    onClick={() => setActiveImg(i)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-smooth ${
                      i === activeImg ? "border-accent" : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div className="text-xs text-muted-foreground mb-1">{product.category}</div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-primary leading-tight">{product.name}</h1>
            <div className="text-sm text-muted-foreground mt-2">{product.weight}</div>

            <div className="mt-5">
              {isContact ? (
                <a
                  href="tel:+98"
                  className="inline-flex items-center gap-2 text-accent font-extrabold text-xl"
                >
                  <Phone className="h-5 w-5" />
                  جهت قیمت تماس بگیرید
                </a>
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-primary fa-num">
                    {formatToman(product.price)}
                  </span>
                </div>
              )}
            </div>

            {product.shortDescription && (
              <p className="mt-4 text-foreground/80 leading-7">{product.shortDescription}</p>
            )}

            {product.highlights && product.highlights.length > 0 && (
              <ul className="mt-5 space-y-2">
                {product.highlights.map((h) => (
                  <li key={h} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-accent shrink-0" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Desktop CTA */}
            {!isContact && (
              <div className="hidden md:flex items-stretch gap-3 mt-7">
                <div className="flex items-center bg-card border border-border rounded-full overflow-hidden">
                  <button onClick={() => setQty((q) => q + 1)} className="px-3 h-12 hover:bg-secondary" aria-label="افزایش">
                    <Plus className="h-4 w-4" />
                  </button>
                  <span className="px-4 fa-num font-bold min-w-[40px] text-center">{new Intl.NumberFormat("fa-IR").format(qty)}</span>
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 h-12 hover:bg-secondary" aria-label="کاهش">
                    <Minus className="h-4 w-4" />
                  </button>
                </div>
                <button
                  onClick={handleAdd}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-full gradient-primary text-primary-foreground font-bold h-12 px-6 shadow-elegant hover:opacity-95 transition-smooth"
                >
                  <ShoppingCart className="h-5 w-5" />
                  افزودن به سبد خرید
                </button>
              </div>
            )}

            {product.description && (
              <div className="mt-8 pt-6 border-t border-border">
                <h2 className="font-bold text-primary mb-2">توضیحات</h2>
                <p className="text-foreground/80 leading-7 whitespace-pre-line">{product.description}</p>
              </div>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="text-xl font-extrabold text-primary mb-4">محصولات مشابه</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Mobile sticky bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur-md border-t border-border p-3 flex items-center gap-2">
        {isContact ? (
          <a
            href="tel:+98"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-accent text-accent-foreground font-bold h-12 px-4 shadow-elegant"
          >
            <Phone className="h-5 w-5" />
            تماس برای قیمت
          </a>
        ) : (
          <>
            <div className="flex items-center bg-card border border-border rounded-full overflow-hidden h-12">
              <button onClick={() => setQty((q) => q + 1)} className="px-3 h-full" aria-label="افزایش">
                <Plus className="h-4 w-4" />
              </button>
              <span className="px-3 fa-num font-bold">{new Intl.NumberFormat("fa-IR").format(qty)}</span>
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 h-full" aria-label="کاهش">
                <Minus className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={handleAdd}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-full gradient-primary text-primary-foreground font-bold h-12 px-4 shadow-elegant"
            >
              <ShoppingCart className="h-5 w-5" />
              افزودن به سبد
            </button>
          </>
        )}
      </div>
    </div>
  );
}
