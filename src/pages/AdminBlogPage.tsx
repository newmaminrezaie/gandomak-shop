import { useCallback, useEffect, useState } from "react";
import { LogOut, Plus, RefreshCw, ShieldCheck, Trash2, Save, Eye, Upload } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { Seo } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { clearAdminToken, getAdminToken, setAdminToken } from "@/lib/adminApi";
import {
  adminCreatePost,
  adminDeletePost,
  adminListPosts,
  adminUpdatePost,
  adminUploadCover,
  type BlogPost,
  type PostStatus,
} from "@/lib/postsStore";

type Draft = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  tags: string;
  body: string;
  status: PostStatus;
  cover: string;
};

const emptyDraft: Draft = {
  title: "",
  slug: "",
  excerpt: "",
  tags: "",
  body: "",
  status: "draft",
  cover: "",
};

function toDraft(p: BlogPost): Draft {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    tags: p.tags.join(", "),
    body: p.body,
    status: p.status,
    cover: p.cover,
  };
}

function parseTags(s: string): string[] {
  return s.split(",").map((t) => t.trim()).filter(Boolean);
}

function TokenGate({ onSubmit }: { onSubmit: (t: string) => void }) {
  const [val, setVal] = useState("");
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-6 shadow-elegant">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-extrabold text-primary">پنل وبلاگ</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          توکن ادمین را وارد کنید (همان توکن سفارش‌ها).
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const v = val.trim();
            if (v) onSubmit(v);
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

export default function AdminBlogPage() {
  const [token, setToken] = useState<string | null>(() => getAdminToken());
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const list = await adminListPosts();
      setPosts(list);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("401") || msg === "unauthorized") {
        clearAdminToken();
        setToken(null);
      } else {
        toast.error(`خطا: ${msg}`);
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!draft.title.trim()) {
      toast.error("عنوان الزامی است");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: draft.title,
        slug: draft.slug || undefined,
        excerpt: draft.excerpt,
        tags: parseTags(draft.tags),
        body: draft.body,
        status: draft.status,
        cover: draft.cover || undefined,
      };
      const saved = draft.id
        ? await adminUpdatePost(draft.id, payload)
        : await adminCreatePost(payload);
      toast.success(draft.status === "published" ? "منتشر شد" : "ذخیره شد");
      setDraft(toDraft(saved));
      await load();
    } catch (e) {
      toast.error(`خطا: ${e instanceof Error ? e.message : "ناشناس"}`);
    } finally {
      setSaving(false);
    }
  };

  const uploadCover = async (file: File) => {
    if (!draft.id) {
      toast.error("ابتدا پست را ذخیره کنید");
      return;
    }
    try {
      const updated = await adminUploadCover(draft.id, file);
      setDraft(toDraft(updated));
      await load();
      toast.success("کاور آپلود شد");
    } catch (e) {
      toast.error(`خطا: ${e instanceof Error ? e.message : "ناشناس"}`);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("این پست حذف شود؟")) return;
    try {
      await adminDeletePost(id);
      if (draft.id === id) setDraft(emptyDraft);
      await load();
      toast.success("حذف شد");
    } catch (e) {
      toast.error(`خطا: ${e instanceof Error ? e.message : "ناشناس"}`);
    }
  };

  if (!token) {
    return (
      <>
        <Seo title="پنل وبلاگ | گندمک شاپ" canonical="https://gandomakshop.ir/admin/blog" />
        <TokenGate onSubmit={(t) => { setAdminToken(t); setToken(t); }} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Seo title="پنل وبلاگ | گندمک شاپ" canonical="https://gandomakshop.ir/admin/blog" />

      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-3 flex-wrap">
          <h1 className="font-extrabold text-primary text-lg">وبلاگ</h1>
          <span className="fa-num text-xs text-muted-foreground">
            ({new Intl.NumberFormat("fa-IR").format(posts.length)})
          </span>
          <div className="flex-1" />
          <Button size="sm" variant="outline" onClick={() => setDraft(emptyDraft)}>
            <Plus className="h-4 w-4 ml-1" /> پست جدید
          </Button>
          <Button size="sm" variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ml-1 ${loading ? "animate-spin" : ""}`} />
            تازه‌سازی
          </Button>
          <Button size="sm" variant="ghost" onClick={() => { clearAdminToken(); setToken(null); }}>
            <LogOut className="h-4 w-4 ml-1" /> خروج
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-4 grid gap-4 lg:grid-cols-[280px_1fr]">
        {/* Posts list */}
        <aside className="bg-card border border-border rounded-xl p-2 max-h-[calc(100vh-120px)] overflow-y-auto">
          {posts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">پستی وجود ندارد</p>
          ) : (
            <ul className="space-y-1">
              {posts.map((p) => (
                <li key={p.id}>
                  <button
                    onClick={() => setDraft(toDraft(p))}
                    className={`w-full text-right px-3 py-2 rounded-lg text-sm transition-colors ${
                      draft.id === p.id ? "bg-primary/10 text-primary" : "hover:bg-secondary"
                    }`}
                  >
                    <div className="font-medium truncate">{p.title || "(بدون عنوان)"}</div>
                    <div className="flex items-center justify-between mt-1 text-[11px] text-muted-foreground">
                      <span>{p.status === "published" ? "منتشر شده" : "پیش‌نویس"}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); remove(p.id); }}
                        className="hover:text-destructive p-0.5"
                        aria-label="حذف"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        {/* Editor */}
        <section className="bg-card border border-border rounded-xl p-4 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">عنوان</label>
              <Input
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                placeholder="عنوان پست"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">slug (اختیاری)</label>
              <Input
                dir="ltr"
                className="font-mono"
                value={draft.slug}
                onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
                placeholder="auto-from-title"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground">خلاصه</label>
            <Textarea
              rows={2}
              value={draft.excerpt}
              onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })}
              placeholder="یک یا دو جمله توضیح کوتاه برای فهرست و SEO"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">تگ‌ها (با کاما جدا کنید)</label>
              <Input
                value={draft.tags}
                onChange={(e) => setDraft({ ...draft, tags: e.target.value })}
                placeholder="غلات, دستورپخت, سلامت"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">کاور</label>
              <div className="flex items-center gap-2">
                {draft.cover && (
                  <img src={draft.cover} alt="" className="h-9 w-14 object-cover rounded border border-border" />
                )}
                <label className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadCover(f);
                      e.target.value = "";
                    }}
                  />
                  <span className="inline-flex items-center gap-1.5 cursor-pointer h-10 px-3 rounded-md border border-input bg-background text-sm hover:bg-accent">
                    <Upload className="h-4 w-4" />
                    {draft.cover ? "تعویض کاور" : "آپلود کاور"}
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-muted-foreground">متن (Markdown)</label>
              <button
                type="button"
                onClick={() => setShowPreview((v) => !v)}
                className="text-xs text-primary inline-flex items-center gap-1"
              >
                <Eye className="h-3.5 w-3.5" />
                {showPreview ? "پنهان کردن پیش‌نمایش" : "نمایش پیش‌نمایش"}
              </button>
            </div>
            <div className={`grid gap-3 ${showPreview ? "lg:grid-cols-2" : ""}`}>
              <Textarea
                rows={18}
                value={draft.body}
                onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                placeholder="# عنوان&#10;متن پست خود را اینجا با Markdown بنویسید..."
                className="font-mono text-sm leading-7"
              />
              {showPreview && (
                <div className="prose prose-neutral max-w-none border border-border rounded-md p-3 bg-background overflow-auto max-h-[480px]">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {draft.body || "*(پیش‌نمایش خالی)*"}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center gap-2 text-sm">
              <label className="text-muted-foreground">وضعیت:</label>
              <select
                value={draft.status}
                onChange={(e) => setDraft({ ...draft, status: e.target.value as PostStatus })}
                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
              >
                <option value="draft">پیش‌نویس</option>
                <option value="published">منتشر شده</option>
              </select>
            </div>
            <Button onClick={save} disabled={saving}>
              <Save className="h-4 w-4 ml-1" />
              {saving ? "در حال ذخیره…" : draft.status === "published" ? "انتشار" : "ذخیره پیش‌نویس"}
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
