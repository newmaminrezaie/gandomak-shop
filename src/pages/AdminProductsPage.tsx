import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  RefreshCw,
  LogOut,
  Search,
  ShieldCheck,
  Package,
  Plus,
  Pencil,
  Trash2,
  Upload,
  X,
  Star,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import {
  clearAdminToken,
  getAdminToken,
  setAdminToken,
} from "@/lib/adminApi";
import {
  adminCreateProduct,
  adminDeleteProduct,
  adminListProducts,
  adminSetImages,
  adminUpdateProduct,
  adminUploadImages,
  loadProducts,
} from "@/lib/productsStore";
import type { Product } from "@/data/products";
import { CATEGORIES, formatToman } from "@/data/products";
import { Seo } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "sonner";

type FormState = {
  id?: string;
  slug: string;
  name: string;
  category: string;
  weight: string;
  price: number;
  oldPrice?: number;
  badge?: string;
  inStock: boolean;
  shortDescription: string;
  description: string;
  highlights: string[];
  images: string[];
};

const EMPTY: FormState = {
  slug: "",
  name: "",
  category: "ادویه",
  weight: "",
  price: 0,
  oldPrice: undefined,
  badge: "",
  inStock: true,
  shortDescription: "",
  description: "",
  highlights: [],
  images: [],
};

function fromProduct(p: Product): FormState {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category,
    weight: p.weight ?? "",
    price: p.price ?? 0,
    oldPrice: p.oldPrice,
    badge: p.badge ?? "",
    inStock: p.inStock ?? true,
    shortDescription: p.shortDescription ?? "",
    description: p.description ?? "",
    highlights: p.highlights ?? [],
    images: p.images ?? [],
  };
}

// ───────────────────── Token gate ─────────────────────
function TokenGate({ onSubmit }: { onSubmit: (t: string) => void }) {
  const [val, setVal] = useState("");
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-6 shadow-elegant">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-extrabold text-primary">پنل محصولات</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          برای مدیریت محصولات، توکن ادمین را وارد کنید.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const v = val.trim();
            if (!v) return;
            onSubmit(v);
          }}
          className="space-y-3"
          dir="ltr"
        >
          <Input
            type="password"
            placeholder="ADMIN_TOKEN"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            autoFocus
            className="font-mono"
          />
          <Button type="submit" className="w-full">ورود</Button>
        </form>
      </div>
    </div>
  );
}

// ───────────────────── Image manager ─────────────────────
function ImageManager({
  productId,
  images,
  onChange,
}: {
  productId: string | undefined;
  images: string[];
  onChange: (next: string[]) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const move = async (idx: number, dir: -1 | 1) => {
    const next = [...images];
    const j = idx + dir;
    if (j < 0 || j >= next.length) return;
    [next[idx], next[j]] = [next[j], next[idx]];
    onChange(next);
    if (productId) {
      try { await adminSetImages(productId, next); } catch (e) { toast.error((e as Error).message); }
    }
  };

  const remove = async (idx: number) => {
    const next = images.filter((_, i) => i !== idx);
    onChange(next);
    if (productId) {
      try { await adminSetImages(productId, next); } catch (e) { toast.error((e as Error).message); }
    }
  };

  const onPick = async (files: FileList | null) => {
    if (!files || !files.length) return;
    if (!productId) {
      toast.error("ابتدا محصول را ذخیره کنید سپس تصویر اضافه نمایید");
      return;
    }
    setUploading(true);
    try {
      const updated = await adminUploadImages(productId, Array.from(files));
      onChange(updated.images);
      toast.success("تصاویر اضافه شد");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-primary">تصاویر (اولین تصویر کاور است)</label>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={uploading || !productId}
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="h-3.5 w-3.5 ml-1" />
          {uploading ? "در حال آپلود..." : "افزودن تصویر"}
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          hidden
          onChange={(e) => onPick(e.target.files)}
        />
      </div>

      {!productId && (
        <p className="text-xs text-muted-foreground bg-muted/40 rounded p-2">
          ابتدا فیلدها را پر کرده و «ذخیره» را بزنید، سپس می‌توانید تصاویر بارگذاری کنید.
        </p>
      )}

      {images.length === 0 ? (
        <div className="text-xs text-muted-foreground text-center py-4 border border-dashed border-border rounded-lg">
          تصویری اضافه نشده است
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {images.map((src, i) => (
            <div
              key={src + i}
              className="relative aspect-square rounded-lg overflow-hidden border border-border bg-secondary group"
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
              {i === 0 && (
                <span className="absolute top-1 right-1 bg-accent text-accent-foreground text-[10px] font-bold rounded-full px-2 py-0.5 inline-flex items-center gap-1">
                  <Star className="h-2.5 w-2.5" /> کاور
                </span>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-smooth" />
              <div className="absolute bottom-1 left-1 right-1 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-smooth">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    className="bg-card border border-border rounded p-1 hover:bg-secondary"
                    title="جابجایی"
                  >
                    <ChevronUp className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    className="bg-card border border-border rounded p-1 hover:bg-secondary"
                    title="جابجایی"
                  >
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="bg-destructive text-destructive-foreground rounded p-1 hover:opacity-90"
                  title="حذف"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ───────────────────── Product form ─────────────────────
function ProductForm({
  initial,
  onSaved,
  onClose,
}: {
  initial: FormState | null;
  onSaved: (p: Product) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<FormState>(initial ?? EMPTY);
  const [saving, setSaving] = useState(false);
  const [highlightInput, setHighlightInput] = useState("");

  useEffect(() => {
    setForm(initial ?? EMPTY);
  }, [initial]);

  const isEditing = !!form.id;

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error("نام محصول الزامی است");
    if (!form.slug.trim()) return toast.error("اسلاگ الزامی است");
    setSaving(true);
    try {
      const payload: Partial<Product> = {
        slug: form.slug.trim(),
        name: form.name.trim(),
        category: form.category,
        weight: form.weight,
        price: Number(form.price) || 0,
        oldPrice: form.oldPrice ? Number(form.oldPrice) : undefined,
        badge: form.badge?.trim() || undefined,
        inStock: form.inStock,
        shortDescription: form.shortDescription,
        description: form.description,
        highlights: form.highlights,
        images: form.images,
      };
      const result = form.id
        ? await adminUpdateProduct(form.id, payload)
        : await adminCreateProduct(payload);
      setForm(fromProduct(result));
      onSaved(result);
      toast.success(isEditing ? "محصول ذخیره شد" : "محصول ایجاد شد");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const addHighlight = () => {
    const v = highlightInput.trim();
    if (!v) return;
    setForm((f) => ({ ...f, highlights: [...f.highlights, v] }));
    setHighlightInput("");
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-primary">نام محصول *</label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="text-xs font-bold text-primary">اسلاگ * (انگلیسی)</label>
          <Input
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            dir="ltr"
            className="font-mono text-sm"
            placeholder="zafaran-negin"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-primary">دسته‌بندی</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
          >
            {CATEGORIES.filter((c) => c !== "همه").map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-primary">وزن / مقدار</label>
          <Input value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} placeholder="۲۰۰ گرم" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-primary">قیمت (تومان)</label>
          <Input
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            dir="ltr"
          />
          <p className="text-[11px] text-muted-foreground mt-1">۰ یعنی «تماس بگیرید»</p>
        </div>
        <div>
          <label className="text-xs font-bold text-primary">قیمت قبلی (اختیاری)</label>
          <Input
            type="number"
            value={form.oldPrice ?? ""}
            onChange={(e) => setForm({ ...form, oldPrice: e.target.value ? Number(e.target.value) : undefined })}
            dir="ltr"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-primary">برچسب (بَج)</label>
          <Input value={form.badge ?? ""} onChange={(e) => setForm({ ...form, badge: e.target.value })} placeholder="پرفروش / جدید" />
        </div>
        <div className="flex items-end gap-3 pb-1">
          <Switch checked={form.inStock} onCheckedChange={(v) => setForm({ ...form, inStock: v })} />
          <span className="text-sm">موجود در انبار</span>
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-primary">توضیح کوتاه</label>
        <Textarea
          rows={2}
          value={form.shortDescription}
          onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
        />
      </div>

      <div>
        <label className="text-xs font-bold text-primary">توضیحات کامل</label>
        <Textarea
          rows={4}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>

      <div>
        <label className="text-xs font-bold text-primary">ویژگی‌ها</label>
        <div className="flex gap-2 mt-1">
          <Input
            value={highlightInput}
            onChange={(e) => setHighlightInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); addHighlight(); }
            }}
            placeholder="مثلاً: کیفیت عالی"
          />
          <Button type="button" variant="outline" size="sm" onClick={addHighlight}>افزودن</Button>
        </div>
        {form.highlights.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {form.highlights.map((h, i) => (
              <span key={i} className="inline-flex items-center gap-1 bg-secondary text-foreground text-xs rounded-full px-2 py-1">
                {h}
                <button
                  type="button"
                  onClick={() => setForm({ ...form, highlights: form.highlights.filter((_, j) => j !== i) })}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <ImageManager
        productId={form.id}
        images={form.images}
        onChange={(next) => setForm((f) => ({ ...f, images: next }))}
      />

      <div className="flex gap-2 pt-2 sticky bottom-0 bg-background py-3 border-t border-border">
        <Button onClick={handleSave} disabled={saving} className="flex-1">
          {saving ? "در حال ذخیره..." : isEditing ? "ذخیره تغییرات" : "ایجاد محصول"}
        </Button>
        <Button variant="ghost" onClick={onClose}>انصراف</Button>
      </div>
    </div>
  );
}

// ───────────────────── Page ─────────────────────
export default function AdminProductsPage() {
  const [token, setToken] = useState<string | null>(() => getAdminToken());
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<FormState | null>(null);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const list = await adminListProducts();
      setProducts(list);
      // also refresh the public store so the home page sees admin changes
      loadProducts(true);
    } catch (e) {
      const msg = (e as Error).message;
      setError(msg);
      if (msg.includes("401") || msg === "unauthorized") {
        clearAdminToken();
        setToken(null);
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) load();
  }, [token, load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      p.slug.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q)
    );
  }, [products, query]);

  const handleNew = () => {
    setEditing(EMPTY);
    setOpen(true);
  };
  const handleEdit = (p: Product) => {
    setEditing(fromProduct(p));
    setOpen(true);
  };
  const handleDelete = async (p: Product) => {
    if (!confirm(`حذف «${p.name}»؟`)) return;
    try {
      await adminDeleteProduct(p.id);
      toast.success("حذف شد");
      load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };
  const handleSaved = (p: Product) => {
    setProducts((prev) => {
      const i = prev.findIndex((x) => x.id === p.id);
      if (i >= 0) {
        const next = [...prev];
        next[i] = p;
        return next;
      }
      return [...prev, p];
    });
    setEditing(fromProduct(p));
  };

  if (!token) {
    return (
      <>
        <Seo title="پنل محصولات | گندمک شاپ" canonical="https://gandomakshop.ir/admin/products" />
        <TokenGate
          onSubmit={(t) => {
            setAdminToken(t);
            setToken(t);
          }}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Seo title="پنل محصولات | گندمک شاپ" canonical="https://gandomakshop.ir/admin/products" />

      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <h1 className="font-extrabold text-primary text-lg">محصولات</h1>
            <span className="fa-num text-xs text-muted-foreground">
              ({new Intl.NumberFormat("fa-IR").format(products.length)})
            </span>
          </div>

          <div className="flex-1" />

          <div className="relative max-w-xs flex-1 min-w-[180px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="نام، اسلاگ، دسته..."
              className="pr-9"
            />
          </div>

          <Button size="sm" onClick={handleNew}>
            <Plus className="h-4 w-4 ml-1" /> محصول جدید
          </Button>
          <Button size="sm" variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ml-1 ${loading ? "animate-spin" : ""}`} />
            تازه‌سازی
          </Button>
          <Button size="sm" variant="ghost" onClick={() => { clearAdminToken(); setToken(null); }}>
            <LogOut className="h-4 w-4 ml-1" />
            خروج
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-4">
        {error && (
          <div className="mb-3 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-sm px-3 py-2">
            {error}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            {loading ? "در حال بارگذاری..." : "محصولی یافت نشد."}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-soft">
            <table className="w-full text-sm">
              <thead className="bg-secondary text-muted-foreground text-xs">
                <tr>
                  <th className="text-right px-3 py-2 font-medium w-16">تصویر</th>
                  <th className="text-right px-3 py-2 font-medium">نام</th>
                  <th className="text-right px-3 py-2 font-medium">دسته</th>
                  <th className="text-right px-3 py-2 font-medium">قیمت</th>
                  <th className="text-right px-3 py-2 font-medium">وضعیت</th>
                  <th className="text-right px-3 py-2 font-medium w-32">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-t border-border hover:bg-secondary/50 transition-smooth">
                    <td className="px-3 py-2">
                      {p.images[0] ? (
                        <img src={p.images[0]} alt="" className="h-10 w-10 rounded object-cover border border-border" />
                      ) : (
                        <div className="h-10 w-10 rounded bg-secondary border border-border" />
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <div className="font-medium">{p.name}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">{p.slug}</div>
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{p.category}</td>
                    <td className="px-3 py-2 fa-num font-bold">
                      {p.price > 0 ? formatToman(p.price) : <span className="text-accent">تماس بگیرید</span>}
                    </td>
                    <td className="px-3 py-2">
                      {p.inStock ? (
                        <span className="text-xs px-2 py-0.5 rounded-full border bg-primary/15 text-primary border-primary/30">موجود</span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full border bg-muted text-muted-foreground border-border">ناموجود</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(p)}>
                          <Pencil className="h-3.5 w-3.5 ml-1" /> ویرایش
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(p)} className="text-destructive hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-full sm:max-w-xl overflow-y-auto" dir="rtl">
          <SheetHeader>
            <SheetTitle className="text-right">
              {editing?.id ? "ویرایش محصول" : "محصول جدید"}
              {editing?.id && (
                <span className="block text-xs font-normal font-mono text-muted-foreground mt-1">
                  {editing.id}
                </span>
              )}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <ProductForm
              initial={editing}
              onSaved={handleSaved}
              onClose={() => setOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
