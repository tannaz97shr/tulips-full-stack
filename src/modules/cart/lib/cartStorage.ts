import type { CartLineItem } from "@/modules/cart/types";

function storageKey(userId: string): string {
  return `tulips:cart:${userId}`;
}

/** Keyed per user id, not a shared/global key, so a shared browser with two accounts never bleeds cart contents between them. */
export function readCart(userId: string): CartLineItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeCart(userId: string, items: CartLineItem[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(userId), JSON.stringify(items));
  } catch {
    // localStorage can throw (quota exceeded, private browsing) — cart state stays in memory for this session.
  }
}
