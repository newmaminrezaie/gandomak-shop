import catSpices from "@/assets/cat-spices.jpg";
import catSaffron from "@/assets/cat-saffron.jpg";
import catTea from "@/assets/cat-tea.jpg";
import catGift from "@/assets/cat-gift-12.jpg";
import catYalda from "@/assets/cat-yalda.jpg";
import catPopular from "@/assets/cat-popular.jpg";
import catDriedFruits from "@/assets/cat-dried-fruits.jpg";
import wordmark from "@/assets/gandomak-wordmark.png";

type Tile = {
  label: string;
  category: string;
  image: string;
  span?: string; // grid span classes
};

const TILES: Tile[] = [
  { label: "زعفران اصل", category: "زعفران", image: catSaffron, span: "col-span-2 row-span-2" },
  { label: "ادویه‌جات", category: "ادویه", image: catSpices },
  { label: "دمنوش و چای", category: "دمنوش و چای", image: catTea },
  { label: "پک هدیه", category: "پک هدیه", image: catGift, span: "col-span-2" },
  { label: "پرطرفدارها", category: "پرطرفدار", image: catPopular },
  { label: "هدیه ویژه", category: "پک هدیه", image: catYalda },
  { label: "خشکبار", category: "خشکبار", image: catDriedFruits, span: "col-span-2" },
];

type Props = {
  onSelect: (cat: string) => void;
};

export default function CategoryGrid({ onSelect }: Props) {
  const handleClick = (cat: string) => {
    onSelect(cat);
    setTimeout(() => {
      document.getElementById("products")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  return (
    <section id="categories" aria-labelledby="cat-heading" className="mx-auto max-w-6xl px-4 pt-5 sm:pt-8">
      <div className="flex items-end justify-between mb-4">
        <div>
          <h1 id="cat-heading" className="leading-tight">
            <img src={wordmark} alt="گندمک شاپ" className="h-14 sm:h-20 object-contain" />
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            طعم اصیل ایران، با بسته‌بندی شایسته یک هدیه.
          </p>
        </div>
        <span className="hidden sm:inline-block text-xs text-muted-foreground">
          دسته‌ای را انتخاب کنید ↓
        </span>
      </div>

      <div className="grid grid-cols-4 auto-rows-[110px] sm:auto-rows-[150px] md:auto-rows-[170px] gap-2 sm:gap-3">
        {TILES.map((t) => (
          <button
            key={t.label}
            onClick={() => handleClick(t.category)}
            className={`group relative overflow-hidden rounded-2xl shadow-tile transition-smooth hover:scale-[1.015] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${t.span ?? ""}`}
            aria-label={t.label}
          >
            <img
              src={t.image}
              alt={t.label}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover transition-smooth group-hover:scale-110"
            />
            <div className="absolute inset-0 gradient-tile-fade" />
            <div className="absolute bottom-0 right-0 left-0 p-2 sm:p-3 text-right">
              <span className="inline-block text-primary-foreground font-extrabold text-sm sm:text-base md:text-lg drop-shadow-md">
                {t.label}
              </span>
              <div className="h-0.5 w-8 mt-1 rounded-full bg-accent" />
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
