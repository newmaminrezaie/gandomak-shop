import { useEffect, useState, useCallback } from "react";
import type { Product } from "@/data/products";
import { PRODUCTS } from "@/data/products";

export type CartItem = { id: string; qty: number };

const STORAGE_KEY = "gandomak-cart-v1";

function read(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function write(items: CartItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("gandomak:cart"));
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(() => read());

  useEffect(() => {
    const sync = () => setItems(read());
    window.addEventListener("gandomak:cart", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("gandomak:cart", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const add = useCallback((id: string, qty = 1) => {
    const next = read();
    const existing = next.find((i) => i.id === id);
    if (existing) existing.qty += qty;
    else next.push({ id, qty });
    write(next);
  }, []);

  const remove = useCallback((id: string) => {
    write(read().filter((i) => i.id !== id));
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    if (qty <= 0) return remove(id);
    const next = read();
    const it = next.find((i) => i.id === id);
    if (it) it.qty = qty;
    else next.push({ id, qty });
    write(next);
  }, [remove]);

  const clear = useCallback(() => write([]), []);

  const detailed = items
    .map((i) => {
      const product = PRODUCTS.find((p) => p.id === i.id);
      return product ? { product, qty: i.qty } : null;
    })
    .filter(Boolean) as { product: Product; qty: number }[];

  const totalCount = items.reduce((s, i) => s + i.qty, 0);
  const totalPrice = detailed.reduce((s, { product, qty }) => s + product.price * qty, 0);

  return { items, detailed, totalCount, totalPrice, add, remove, setQty, clear };
}
