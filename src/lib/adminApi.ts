// Thin client for the protected /api/orders admin endpoint.
// No client-side caching: every call hits the server. If the network fails,
// the caller gets an error and can show it in the UI.

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
const LEGACY_CACHE_KEY = "gandomak_admin_orders_cache";

// One-time cleanup: wipe any pre-existing cached snapshot from previous builds.
if (typeof window !== "undefined") {
  try {
    localStorage.removeItem(LEGACY_CACHE_KEY);
  } catch {
    // ignore
  }
}

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

export type FetchResult =
  | { ok: true; orders: AdminOrder[]; fetchedAt: string }
  | { ok: false; error: string; status?: number };

/**
 * Fetch all orders directly from the server. No fallback cache.
 */
export async function fetchOrders(token: string): Promise<FetchResult> {
  try {
    const res = await fetch("/api/orders", {
      headers: { "x-admin-token": token },
      cache: "no-store",
    });
    if (res.status === 401) {
      return { ok: false, error: "توکن ادمین نامعتبر است.", status: 401 };
    }
    if (!res.ok) {
      return { ok: false, error: `خطای سرور (${res.status}).`, status: res.status };
    }
    const data = (await res.json()) as AdminOrder[];
    return {
      ok: true,
      orders: data,
      fetchedAt: new Date().toISOString(),
    };
  } catch {
    return {
      ok: false,
      error: "اتصال به سرور برقرار نیست.",
    };
  }
}
