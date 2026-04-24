import { Link } from "react-router-dom";
import { Phone } from "lucide-react";
import { Product, formatToman } from "@/data/products";

export default function ProductCard({ product }: { product: Product }) {
  const isContact = product.price === 0;
  return (
    <Link
      to={`/product/${product.slug}`}
      className="group block bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-elegant transition-smooth border border-border"
    >
      <div className="relative aspect-square bg-secondary overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          decoding="async"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><rect fill='%23f1ead8' width='200' height='200'/><text x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%230E4A36' font-family='Vazirmatn,sans-serif' font-size='14'>گندمک</text></svg>";
          }}
          className="h-full w-full object-cover transition-smooth group-hover:scale-105"
        />
        {product.badge && (
          <span className="absolute top-2 right-2 bg-accent text-accent-foreground text-[10px] font-bold rounded-full px-2.5 py-1 shadow-soft">
            {product.badge}
          </span>
        )}
      </div>
      <div className="p-3 sm:p-4">
        <div className="text-[11px] text-muted-foreground mb-1">{product.category}</div>
        <h3 className="font-bold text-sm sm:text-base text-foreground line-clamp-2 min-h-[40px]">{product.name}</h3>
        <div className="text-[11px] text-muted-foreground mt-1">{product.weight}</div>
        <div className="mt-3 flex items-center justify-between">
          {isContact ? (
            <span className="inline-flex items-center gap-1 text-accent font-bold text-sm">
              <Phone className="h-3.5 w-3.5" />
              تماس بگیرید
            </span>
          ) : (
            <span className="font-extrabold text-primary text-sm sm:text-base fa-num">
              {formatToman(product.price)}
            </span>
          )}
          <span className="text-xs text-accent font-bold opacity-0 group-hover:opacity-100 transition-smooth">
            مشاهده ←
          </span>
        </div>
      </div>
    </Link>
  );
}
