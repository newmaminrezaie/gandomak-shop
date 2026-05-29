/**
 * Products store — single source of truth for the catalog on the frontend.
 *
 * - Starts from the static SEED in src/data/products.ts (so first paint never
 *   has an empty grid, even if the API is slow / unreachable).
 * - Fetches /api/products on mount and replaces the cache when it succeeds.
 * - Admin CRUD calls use the same `x-admin-token` as the orders admin.
 */
import { useEffect, useState } from "react";
import { PRODUCTS as SEED, type Product } from "@/data/products";
import { getAdminToken } from "@/lib/adminApi";

let cache: Product[] = SEED;
let loaded = false;
let inflight: Promise<void> | null = null;
const listeners = new Set<() => void>();

function notify() {
  for (const l of listeners) l();
}

export function getProductsSync(): Product[] {
  return cache;
}

export function getProductByIdSync(id: string): Product | undefined {
  return cache.find((p) => p.id === id);
}

export function getProductBySlugSync(slug: string): Product | undefined {
  return cache.find((p) => p.slug === slug);
}

function setCache(next: Product[]) {
  // Normalize so admin-edited rows match the Product type
  cache = next.map((p) => ({
    ...p,
    highlights: p.highlights ?? [],
    images: p.images ?? [],
  }));
  loaded = true;
  notify();
}

export async function loadProducts(force = false): Promise<void> {
  if (inflight) return inflight;
  if (loaded && !force) return;
  inflight = (async () => {
    try {
      const r = await fetch("/api/products", { cache: "no-store" });
      if (r.ok) {
        const data = (await r.json()) as Product[];
        if (Array.isArray(data) && data.length) setCache(data);
        else loaded = true;
      }
    } catch {
      // keep seed cache, try again later
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

export function useProducts(): Product[] {
  const [list, setList] = useState<Product[]>(cache);
  useEffect(() => {
    const l = () => setList(cache);
    listeners.add(l);
    loadProducts();
    return () => {
      listeners.delete(l);
    };
  }, []);
  return list;
}

// ───────────────────── Admin API ─────────────────────
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

export async function adminListProducts(): Promise<Product[]> {
  const r = await fetch("/api/admin/products", { headers: authHeaders(), cache: "no-store" });
  return jsonOrThrow(r);
}

export async function adminCreateProduct(p: Partial<Product>): Promise<Product> {
  const r = await fetch("/api/admin/products", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(p),
  });
  const created = await jsonOrThrow(r);
  await loadProducts(true);
  return created;
}

export async function adminUpdateProduct(id: string, p: Partial<Product>): Promise<Product> {
  const r = await fetch(`/api/admin/products/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(p),
  });
  const updated = await jsonOrThrow(r);
  await loadProducts(true);
  return updated;
}

export async function adminDeleteProduct(id: string): Promise<void> {
  const r = await fetch(`/api/admin/products/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  await jsonOrThrow(r);
  await loadProducts(true);
}

export async function adminUploadImages(id: string, files: File[]): Promise<Product> {
  const fd = new FormData();
  for (const f of files) fd.append("files", f);
  const r = await fetch(`/api/admin/products/${encodeURIComponent(id)}/images`, {
    method: "POST",
    headers: authHeaders(),
    body: fd,
  });
  const updated = await jsonOrThrow(r);
  await loadProducts(true);
  return updated;
}

export async function adminSetImages(id: string, images: string[]): Promise<Product> {
  const r = await fetch(`/api/admin/products/${encodeURIComponent(id)}/images`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ images }),
  });
  const updated = await jsonOrThrow(r);
  await loadProducts(true);
  return updated;
}
