import { useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryGrid from "@/components/CategoryGrid";
import CategoryChips from "@/components/CategoryChips";
import ProductCard from "@/components/ProductCard";
import { PRODUCTS } from "@/data/products";
import { Seo } from "@/lib/seo";

const Index = () => {
  const [cat, setCat] = useState<string>("همه");

  const filtered = useMemo(() => {
    if (cat === "همه") return PRODUCTS;
    return PRODUCTS.filter((p) => p.category === cat);
  }, [cat]);

  const popular = useMemo(
    () => PRODUCTS.filter((p) => p.badge === "پرفروش" || p.category === "پرطرفدار").slice(0, 6),
    []
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Seo
        title="گندمک شاپ | فروشگاه آنلاین زعفران، ادویه، دمنوش و پک هدیه"
        description="خرید آنلاین زعفران نگین، ادویه‌های طبیعی، دمنوش، مغزها و پک هدیه از گندمک شاپ. ارسال سریع به سراسر ایران."
        canonical="https://gandomakshop.ir/"
        image="https://gandomakshop.ir/logo.png"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "گندمک شاپ",
            url: "https://gandomakshop.ir/",
            logo: "https://gandomakshop.ir/logo.png",
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "گندمک شاپ",
            url: "https://gandomakshop.ir/",
            inLanguage: "fa-IR",
          },
        ]}
      />
      <Header />
      <main className="flex-1">
        <CategoryGrid onSelect={setCat} />

        {/* Popular rail */}
        {popular.length > 0 && (
          <section className="mx-auto max-w-6xl px-4 mt-10">
            <div className="flex items-end justify-between mb-3">
              <h2 className="text-xl sm:text-2xl font-extrabold text-primary">پرفروش‌ترین‌ها</h2>
              <button
                onClick={() => setCat("پرطرفدار")}
                className="text-sm text-accent font-bold hover:underline"
              >
                همه ←
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {popular.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* All / filtered products */}
        <section id="products" className="mx-auto max-w-6xl px-4 mt-12 scroll-mt-20">
          <div className="flex items-end justify-between mb-3">
            <h2 className="text-xl sm:text-2xl font-extrabold text-primary">
              {cat === "همه" ? "همه محصولات" : cat}
            </h2>
            <span className="text-xs text-muted-foreground fa-num">
              {new Intl.NumberFormat("fa-IR").format(filtered.length)} کالا
            </span>
          </div>

          <div className="sticky top-16 z-30 bg-background/90 backdrop-blur-md py-2 -mx-4 px-4 border-b border-border mb-5">
            <CategoryChips active={cat} onChange={setCat} />
          </div>

          {filtered.length === 0 ? (
            <div className="text-center text-muted-foreground py-20">محصولی در این دسته یافت نشد.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
