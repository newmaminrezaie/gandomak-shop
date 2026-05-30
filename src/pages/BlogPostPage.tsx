import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Seo } from "@/lib/seo";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { fetchPost, type BlogPost } from "@/lib/postsStore";

const fmtDate = (iso?: string | null) => {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("fa-IR", { dateStyle: "long" }).format(new Date(iso));
  } catch {
    return "";
  }
};

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null | undefined>(undefined);

  useEffect(() => {
    if (!slug) return;
    fetchPost(slug).then(setPost);
  }, [slug]);

  if (post === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        در حال بارگذاری…
      </div>
    );
  }

  if (post === null) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 mx-auto max-w-3xl w-full px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-primary mb-2">مطلب یافت نشد</h1>
          <p className="text-muted-foreground mb-6">این پست حذف شده یا منتشر نشده است.</p>
          <Link to="/blog" className="text-primary underline">بازگشت به وبلاگ</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const canonical = `https://gandomakshop.ir/blog/${post.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    image: post.cover ? [`https://gandomakshop.ir${post.cover}`] : undefined,
    datePublished: post.publishedAt ?? post.createdAt,
    dateModified: post.updatedAt,
    description: post.excerpt || undefined,
    mainEntityOfPage: canonical,
    author: { "@type": "Organization", name: "گندمک شاپ" },
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Seo
        title={`${post.title} | وبلاگ گندمک شاپ`}
        description={post.excerpt || post.title}
        canonical={canonical}
        image={post.cover ? `https://gandomakshop.ir${post.cover}` : undefined}
        type="article"
        jsonLd={jsonLd}
      />
      <Header />
      <main className="flex-1 mx-auto max-w-3xl w-full px-4 py-8">
        <nav className="text-xs text-muted-foreground mb-4">
          <Link to="/blog" className="hover:text-primary">وبلاگ</Link>
          <span className="mx-1">/</span>
          <span className="text-foreground/70">{post.title}</span>
        </nav>

        {post.cover && (
          <div className="rounded-2xl overflow-hidden mb-6 bg-secondary">
            <img src={post.cover} alt={post.title} className="w-full h-auto object-cover" />
          </div>
        )}

        <h1 className="text-3xl sm:text-4xl font-extrabold text-primary leading-tight">
          {post.title}
        </h1>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground fa-num">
          <span>{fmtDate(post.publishedAt ?? post.createdAt)}</span>
          {post.tags.length > 0 && (
            <span className="flex flex-wrap gap-1">
              {post.tags.map((t) => (
                <span key={t} className="px-2 py-0.5 rounded-full bg-secondary border border-border">
                  #{t}
                </span>
              ))}
            </span>
          )}
        </div>

        <article className="mt-8 prose prose-neutral max-w-none rtl:prose-headings:text-right leading-8 text-foreground/90
          prose-headings:text-primary prose-headings:font-extrabold
          prose-a:text-primary prose-a:underline-offset-4
          prose-img:rounded-xl prose-img:mx-auto
          prose-code:bg-secondary prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
          prose-blockquote:border-r-4 prose-blockquote:border-r-primary prose-blockquote:border-l-0
          prose-blockquote:bg-secondary/50 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-lg
          prose-blockquote:not-italic">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.body}</ReactMarkdown>
        </article>
      </main>
      <Footer />
    </div>
  );
}
