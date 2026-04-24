/* ============================================================================
 * HOW TO EDIT / ADD PRODUCTS
 * ----------------------------------------------------------------------------
 * Everything about the catalog lives in this file. No CMS, no database.
 *
 * To CHANGE a price/title/weight/badge:
 *   Find the product object below and edit the field. Save. Done.
 *
 * To CHANGE or ADD images for a product:
 *   Edit its `images: [...]` array. The FIRST item is the cover/thumbnail.
 *   - Remote image: just paste the URL string.
 *   - Local image in /public/images/: use "/images/filename.webp"
 *
 * To ADD a new product:
 *   Copy the template below, give it a UNIQUE `id`/`slug`, fill in fields.
 *
 *   {
 *     id: "p-new",
 *     slug: "product-slug",
 *     name: "نام محصول",
 *     category: "ادویه",
 *     weight: "۲۰۰ گرم",
 *     price: 300000,
 *     images: ["/images/photo.webp"],
 *   },
 * ========================================================================== */

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  weight: string;
  price: number;
  oldPrice?: number;
  images: string[];
  badge?: string;
  shortDescription?: string;
  description?: string;
  highlights?: string[];
  inStock?: boolean;
};

export const CATEGORIES = [
  "همه",
  "ادویه",
  "مغزها",
  "دمنوش و چای",
  "زعفران",
  "پرطرفدار",
  "پک هدیه",
  "تازه‌ها",
] as const;

export const PRODUCTS: Product[] = [
  // ── ادویه ─────────────────────────────────────────────────────────────────
  {
    id: "p-108",
    slug: "paprika",
    name: "پابریکا",
    category: "ادویه",
    weight: "بسته‌بندی شیک",
    price: 400000,
    images: ["/images/photo21084102743.webp"],
    shortDescription: "پابریکا بسته‌بندی شیک گندمک.",
    description: "پابریکا بسته بندی شیک",
    highlights: ["بسته‌بندی بهداشتی", "کیفیت عالی"],
  },
  {
    id: "p-111",
    slug: "zardchoobeh",
    name: "زردچوبه",
    category: "ادویه",
    weight: "۲۰۰ گرم",
    price: 300000,
    images: ["/images/ef0a8b0f43a1ce8655479e40d0e8f1d0.webp"],
    shortDescription: "زردچوبه ۲۰۰ گرمی در بسته‌بندی شیک.",
    description: "زردچوبه 200 گرمی در بسته بندی شیک",
    highlights: ["۲۰۰ گرم خالص", "بسته‌بندی شیک", "کیفیت درجه یک"],
  },
  {
    id: "p-402",
    slug: "adviyeh-siro-kareh",
    name: "ادویه سیرو کره",
    category: "ادویه",
    weight: "بسته‌بندی شیک",
    price: 0,
    images: [
      "/images/photo22576817809.webp",
      "/images/photo24375142991.webp",
    ],
    shortDescription: "ادویه سیرو کره گندمک، ترکیب منحصربه‌فرد.",
    highlights: ["بسته‌بندی بهداشتی", "ترکیب طبیعی"],
    inStock: true,
  },
  {
    id: "p-404",
    slug: "adviyeh-piyaz-jafari",
    name: "ادویه پیاز جعفری",
    category: "ادویه",
    weight: "بسته‌بندی شیک",
    price: 0,
    images: ["/images/photo24375142991-1.webp"],
    shortDescription: "ادویه پیاز جعفری گندمک.",
    highlights: ["بسته‌بندی بهداشتی", "ترکیب طبیعی"],
    inStock: true,
  },

  // ── مغزها ─────────────────────────────────────────────────────────────────
  {
    id: "p-109",
    slug: "badam",
    name: "بادام",
    category: "مغزها",
    weight: "۱ کیلوگرم",
    price: 500000,
    images: ["/images/241594504834881bdc3b3ae68a559885.webp"],
    shortDescription: "مغز بادام یک کیلویی، تازه و خوش‌طعم.",
    description: "مغز بادام",
    highlights: ["۱ کیلو خالص", "مغز درجه یک", "بسته‌بندی بهداشتی"],
  },

  // ── دمنوش و چای ───────────────────────────────────────────────────────────
  {
    id: "p-118",
    slug: "barg-beh-limu",
    name: "برگ به لیمو",
    category: "دمنوش و چای",
    weight: "بسته‌بندی شیک",
    price: 0,
    images: [
      "/images/photo21109004521.webp",
      "/images/photo21109004567.webp",
    ],
    shortDescription: "برگ به لیمو خشک، مناسب دمنوش.",
    highlights: ["طبیعی و خشک شده", "عطر دلپذیر", "بسته‌بندی بهداشتی"],
    inStock: true,
  },
  {
    id: "p-144",
    slug: "chai-miveh",
    name: "چای میوه",
    category: "دمنوش و چای",
    weight: "بسته‌بندی شیک",
    price: 0,
    images: ["/images/photo21104201583-e1759305301938.webp"],
    shortDescription: "چای میوه گندمک، ترکیب میوه‌های طبیعی.",
    highlights: ["ترکیب طبیعی", "بدون رنگ مصنوعی", "عطر میوه‌ای"],
    inStock: true,
  },
  {
    id: "p-417",
    slug: "hel",
    name: "هل",
    category: "دمنوش و چای",
    weight: "بسته‌بندی شیک",
    price: 70000,
    images: ["/images/Hel1.webp"],
    shortDescription: "هل خشک درجه یک، عطر قوی و طبیعی.",
    highlights: ["هل درجه یک", "خشک شده طبیعی", "بسته‌بندی بهداشتی"],
  },

  // ── زعفران ────────────────────────────────────────────────────────────────
  {
    id: "p-359",
    slug: "zafaran-kadooyi-choobi",
    name: "زعفران کادویی با ظرف چوبی",
    category: "زعفران",
    weight: "۱ مثقال (۴.۶۰۸ گرم)",
    price: 1200000,
    images: ["/images/final-wooden1-UltraPic.webp"],
    badge: "هدیه ویژه",
    shortDescription: "زعفران نگین در ظرف چوبی خاتم‌کاری شده.",
    description: "زعفران کادویی با ظرف چوبی خاتم‌کاری ایرانی. مناسب هدیه.",
    highlights: ["ظرف چوبی خاتم‌کاری", "زعفران نگین اعلا", "مناسب هدیه"],
  },
  {
    id: "p-370",
    slug: "rishe-zafaran",
    name: "ریشه زعفران (۲.۳ گرمی)",
    category: "زعفران",
    weight: "نیم مثقال (۲.۳ گرم)",
    price: 130000,
    images: ["/images/Sefid1Final.webp"],
    shortDescription: "ریشه زعفران گناباد، سرشار از آنتی‌اکسیدان.",
    description: "ریشه زعفران طبیعی، مناسب دمنوش و آشپزی.",
    highlights: ["طبیعی و تازه", "سرشار از آنتی‌اکسیدان", "اقتصادی"],
  },
  {
    id: "p-374",
    slug: "zafaran-negin",
    name: "زعفران نگین (۴.۶۰۸ گرمی)",
    category: "زعفران",
    weight: "۱ مثقال (۴.۶۰۸ گرم)",
    price: 960000,
    images: [
      "/images/negin1.webp",
      "/images/Negin1-2-1.webp",
      "/images/Negin1-3.webp",
    ],
    badge: "پرفروش",
    shortDescription: "زعفران نگین اصل، تمام قرمز و پرعطر.",
    description: "زعفران نگین طبیعی با رشته‌های کاملاً قرمز، ضخیم و بدون بخش زرد.",
    highlights: ["کیفیت صادراتی", "امسالی و تازه", "خشک شده سنتی"],
  },
  {
    id: "p-412",
    slug: "zafaran-kadooyi",
    name: "زعفران کادویی",
    category: "زعفران",
    weight: "۱ مثقال (۴.۶۰۸ گرم)",
    price: 970000,
    images: ["/images/Round1-F.webp"],
    shortDescription: "زعفران نگین در ظرف گرد فلزی.",
    highlights: ["ظرف فلزی شیک", "زعفران نگین اعلا", "مناسب هدیه"],
  },
  {
    id: "p-414",
    slug: "zafaran-narmeh",
    name: "زعفران نرمه",
    category: "زعفران",
    weight: "۱ مثقال (۴.۶۰۸ گرم)",
    price: 380000,
    images: [
      "/images/narmeh11.webp",
      "/images/narmeh2.webp",
    ],
    shortDescription: "زعفران نرمه آشپزخانه‌ای، مناسب رستوران و بستنی‌فروشی.",
    description: "زعفران نرمه با قیمت مناسب، مناسب آشپزخانه‌ها و بستنی‌فروشی‌ها.",
    highlights: ["قیمت مناسب", "رنگ‌دهی خوب", "بسته‌بندی وکیوم"],
  },

  // ── پرطرفدار ──────────────────────────────────────────────────────────────
  {
    id: "p-372",
    slug: "zereshk-pofaki-1kg",
    name: "زرشک پفکی (۱ کیلویی)",
    category: "پرطرفدار",
    weight: "۱ کیلوگرم",
    price: 700000,
    images: [
      "/images/1006146401_17899734.webp",
      "/images/zereshk-1.webp",
    ],
    badge: "عمده",
    shortDescription: "زرشک پفکی قائنات یک کیلویی، درجه یک.",
    description: "زرشک پفکی مرغوب از باغات قائنات، پاک شده و بسته‌بندی شده.",
    highlights: ["۱ کیلو خالص", "قائنات درجه یک", "پاک شده"],
  },

  // ── پک هدیه ───────────────────────────────────────────────────────────────
  {
    id: "p-167",
    slug: "pak-hadiyeh",
    name: "پک هدیه",
    category: "پک هدیه",
    weight: "متنوع",
    price: 200000,
    images: [
      "/images/photo20830769932.webp",
      "/images/photo20830769992.webp",
      "/images/photo20830770007.webp",
    ],
    badge: "هدیه",
    shortDescription: "پک هدیه گندمک، انتخابی شایسته برای عزیزان.",
    highlights: ["بسته‌بندی زیبا", "محصولات متنوع", "مناسب هدیه"],
  },
  {
    id: "p-406",
    slug: "pak-yalda",
    name: "پک یلدا",
    category: "پک هدیه",
    weight: "متنوع",
    price: 0,
    images: [
      "/images/photo22928663292.webp",
      "/images/photo22928663308.webp",
    ],
    badge: "یلدا",
    shortDescription: "پک یلدای گندمک، هدیه‌ای ویژه برای شب یلدا.",
    highlights: ["بسته‌بندی یلدایی", "محصولات متنوع", "مناسب هدیه"],
    inStock: true,
  },

  // ── تازه‌ها ────────────────────────────────────────────────────────────────
  {
    id: "p-121",
    slug: "pak-12tayi",
    name: "پک ۱۲تایی گندمک",
    category: "تازه‌ها",
    weight: "۱۲ عدد",
    price: 200000,
    images: [
      "/images/photo19103402972.webp",
      "/images/photo19103402932.webp",
      "/images/photo19103402979.webp",
      "/images/photo19103423004.webp",
    ],
    badge: "جدید",
    shortDescription: "پک ۱۲تایی محصولات گندمک.",
    highlights: ["۱۲ عدد متنوع", "بسته‌بندی شیک", "صرفه‌جویی در خرید"],
  },
];

export const formatToman = (n: number) =>
  new Intl.NumberFormat("fa-IR").format(n) + " تومان";

export const getProductBySlug = (slug: string): Product | undefined =>
  PRODUCTS.find((p) => p.slug === slug);
