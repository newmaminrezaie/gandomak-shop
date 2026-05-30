/**
 * Blog posts client. Uses same admin token as products/orders.
 */
import { getAdminToken } from "@/lib/adminApi";

export type PostStatus = "draft" | "published";

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  cover: string;
  excerpt: string;
  body: string;
  tags: string[];
  status: PostStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
};

function authHeaders(): HeadersInit {
  const t = getAdminToken();
  return t ? { "x-admin-token": t } : {};
}

async function jsonOrThrow(r: Response) {
  if (!r.ok) {
    let msg = `HTTP ${r.status}`;
    try {
      const j = await r.json();
      if (j?.error) msg = j.error;
    } catch { /* ignore */ }
    throw new Error(msg);
  }
  return r.json();
}

export async function fetchPosts(): Promise<BlogPost[]> {
  const r = await fetch("/api/posts", { cache: "no-store" });
  if (!r.ok) return [];
  return r.json();
}

export async function fetchPost(slug: string): Promise<BlogPost | null> {
  const r = await fetch(`/api/posts/${encodeURIComponent(slug)}`, { cache: "no-store" });
  if (r.status === 404) return null;
  if (!r.ok) return null;
  return r.json();
}

export async function adminListPosts(): Promise<BlogPost[]> {
  const r = await fetch("/api/admin/posts", { headers: authHeaders(), cache: "no-store" });
  return jsonOrThrow(r);
}

export async function adminCreatePost(p: Partial<BlogPost>): Promise<BlogPost> {
  const r = await fetch("/api/admin/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(p),
  });
  return jsonOrThrow(r);
}

export async function adminUpdatePost(id: string, p: Partial<BlogPost>): Promise<BlogPost> {
  const r = await fetch(`/api/admin/posts/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(p),
  });
  return jsonOrThrow(r);
}

export async function adminDeletePost(id: string): Promise<void> {
  const r = await fetch(`/api/admin/posts/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  await jsonOrThrow(r);
}

export async function adminUploadCover(id: string, file: File): Promise<BlogPost> {
  const fd = new FormData();
  fd.append("file", file);
  const r = await fetch(`/api/admin/posts/${encodeURIComponent(id)}/cover`, {
    method: "POST",
    headers: authHeaders(),
    body: fd,
  });
  return jsonOrThrow(r);
}
