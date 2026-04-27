// Thin client for the protected /api/orders admin endpoint.
// Caches the last successful response in localStorage so the admin
// can still review the most recent snapshot when offline.

export type OrderItem = {
  id: string;
  name: string;
  qty: number;
  price: number;
};

export type OrderStatus = "pending" | "paid" | "failed" | "awaiting_review";

export type AdminOrder = {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_postalcode?: string | null;
  items: OrderItem[];
  subtotal_toman?: number;
  packaging_fee?: number;
  shipping_method?: string | null;
  total_toman: number;
  total_rial: number;
  payment_method: "zibal" | "card";
  track_id?: string | null;
  ref_number?: string | null;
  card_number?: string | null;
  card_ref?: string | null;
  paid_at?: string | null;
  status: OrderStatus;
  created_at: string;
};

const TOKEN_KEY = "gandomak_admin_token";
const CACHE_KEY = "gandomak_admin_orders_cache";

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAdminToken() {
  localStorage.removeItem(TOKEN_KEY);
}

type CacheShape = { fetchedAt: string; orders: AdminOrder[] };

export function readOrdersCache(): CacheShape | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheShape;
    if (!Array.isArray(parsed.orders)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeOrdersCache(orders: AdminOrder[]) {
  try {
    const payload: CacheShape = { fetchedAt: new Date().toISOString(), orders };
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    // quota exceeded — ignore
  }
}

export type FetchResult =
  | { ok: true; orders: AdminOrder[]; fromCache: false; fetchedAt: string }
  | { ok: true; orders: AdminOrder[]; fromCache: true; fetchedAt: string; error?: string }
  | { ok: false; error: string; status?: number };

/**
 * Fetch all orders. On network failure (offline, server down) returns the
 * last cached snapshot if available, marked with `fromCache: true`.
 */
export async function fetchOrders(token: string): Promise<FetchResult> {
  try {
    const res = await fetch("/api/orders", {
      headers: { "x-admin-token": token },
    });
    if (res.status === 401) {
      return { ok: false, error: "توکن ادمین نامعتبر است.", status: 401 };
    }
    if (!res.ok) {
      const cached = readOrdersCache();
      if (cached) {
        return {
          ok: true,
          orders: cached.orders,
          fromCache: true,
          fetchedAt: cached.fetchedAt,
          error: `سرور پاسخ داد ${res.status}`,
        };
      }
      return { ok: false, error: `خطای سرور (${res.status}).`, status: res.status };
    }
    const data = (await res.json()) as AdminOrder[];
    writeOrdersCache(data);
    return {
      ok: true,
      orders: data,
      fromCache: false,
      fetchedAt: new Date().toISOString(),
    };
  } catch {
    const cached = readOrdersCache();
    if (cached) {
      return {
        ok: true,
        orders: cached.orders,
        fromCache: true,
        fetchedAt: cached.fetchedAt,
        error: "اتصال به سرور برقرار نیست — نمایش از حافظه.",
      };
    }
    return {
      ok: false,
      error: "اتصال به سرور برقرار نیست و داده‌ای در حافظه ذخیره نشده.",
    };
  }
}
