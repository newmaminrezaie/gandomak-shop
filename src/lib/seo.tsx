import { useEffect } from "react";

type SeoProps = {
  title: string;
  description?: string;
  canonical?: string;
  image?: string;
  type?: "website" | "product" | "article";
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
};

function upsertMeta(attr: "name" | "property", key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", value);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export function Seo({ title, description, canonical, image, type = "website", jsonLd }: SeoProps) {
  useEffect(() => {
    document.title = title;
    if (description) {
      upsertMeta("name", "description", description);
      upsertMeta("property", "og:description", description);
    }
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:type", type);
    if (image) {
      upsertMeta("property", "og:image", image);
      upsertMeta("name", "twitter:image", image);
    }
    const url = canonical ?? window.location.href;
    upsertLink("canonical", url);
    upsertMeta("property", "og:url", url);

    // JSON-LD
    document.querySelectorAll('script[data-seo-jsonld="1"]').forEach((n) => n.remove());
    if (jsonLd) {
      const arr = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      arr.forEach((obj) => {
        const s = document.createElement("script");
        s.type = "application/ld+json";
        s.dataset.seoJsonld = "1";
        s.text = JSON.stringify(obj);
        document.head.appendChild(s);
      });
    }
  }, [title, description, canonical, image, type, JSON.stringify(jsonLd)]);

  return null;
}
