import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Seo } from "@/lib/seo";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { fetchPosts, type BlogPost } from "@/lib/postsStore";

const fmtDate = (iso?: string | null) => {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" }).format(new Date(iso));
  } catch {
    return "";
  }
};

export default function BlogListPage() {
  const [posts, setPosts] = useState<BlogPost[] | null>(null);

  useEffect(() => {
    fetchPosts().then(setPosts);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Seo
        title="وبلاگ گندمک شاپ | مقالات و دستورپخت‌ها"
        description="آخرین مطالب، دستورپخت‌ها و راهنمای استفاده از محصولات گندمک شاپ."
        canonical="https://gandomakshop.ir/blog"
      />
      <Header />
      <main className="flex-1 mx-auto max-w-5xl w-full px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-primary">وبلاگ گندمک</h1>
          <p className="mt-2 text-muted-foreground text-sm">
            مقالات، دستورپخت و نکات کاربردی درباره غلات و حبوبات.
          </p>
        </header>

        {posts === null ? (
          <div className="text-center py-20 text-muted-foreground">در حال بارگذاری…</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">هنوز مطلبی منتشر نشده است.</div>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <li key={p.id}>
                <Link
                  to={`/blog/${p.slug}`}
                  className="group block bg-card border border-border rounded-2xl overflow-hidden shadow-soft hover:shadow-elegant transition-smooth"
                >
                  {p.cover ? (
                    <div className="aspect-[16/10] overflow-hidden bg-secondary">
                      <img
                        src={p.cover}
                        alt={p.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[16/10] bg-gradient-to-br from-secondary to-muted" />
                  )}
                  <div className="p-4">
                    <h2 className="font-bold text-lg leading-7 text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {p.title}
                    </h2>
                    {p.excerpt && (
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-3 leading-6">
                        {p.excerpt}
                      </p>
                    )}
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground fa-num">
                      <span>{fmtDate(p.publishedAt ?? p.createdAt)}</span>
                      {p.tags.length > 0 && (
                        <span className="truncate max-w-[60%] text-left">
                          {p.tags.slice(0, 3).map((t) => `#${t}`).join(" ")}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
      <Footer />
    </div>
  );
}
