"use client";

import { createContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import { readCart, writeCart } from "@/modules/cart/lib/cartStorage";
import type { CartLineItem } from "@/modules/cart/types";

export interface CartContextValue {
  items: CartLineItem[];
  itemCount: number;
  subtotal: number;
  addItem: (item: Omit<CartLineItem, "quantity">, quantity: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
}

export const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const userId = session?.user.id;
  const [items, setItems] = useState<CartLineItem[]>([]);

  useEffect(() => {
    // Syncing from an external source (localStorage) that depends on the
    // session resolving asynchronously — not available during the first
    // render, so it can't be computed as a lazy useState initializer.
    if (status === "authenticated" && userId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setItems(readCart(userId));
    } else if (status === "unauthenticated") {
      // Clears in-memory state only, not storage — the other user's cart
      // stays under their own key and rehydrates on their next login.
      setItems([]);
    }
  }, [status, userId]);

  useEffect(() => {
    if (status === "authenticated" && userId) {
      writeCart(userId, items);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const value = useMemo<CartContextValue>(() => {
    function addItem(item: Omit<CartLineItem, "quantity">, quantity: number) {
      setItems((current) => {
        const existing = current.find((line) => line.productId === item.productId);
        if (existing) {
          const nextQuantity = Math.min(existing.maxStock, existing.quantity + quantity);
          return current.map((line) =>
            line.productId === item.productId ? { ...line, quantity: nextQuantity } : line
          );
        }
        return [...current, { ...item, quantity: Math.min(item.maxStock, quantity) }];
      });
    }

    function updateQuantity(productId: string, quantity: number) {
      setItems((current) =>
        current.map((line) =>
          line.productId === productId
            ? { ...line, quantity: Math.max(1, Math.min(line.maxStock, quantity)) }
            : line
        )
      );
    }

    function removeItem(productId: string) {
      setItems((current) => current.filter((line) => line.productId !== productId));
    }

    function clear() {
      setItems([]);
    }

    return {
      items,
      itemCount: items.reduce((sum, line) => sum + line.quantity, 0),
      subtotal: items.reduce((sum, line) => sum + line.price * line.quantity, 0),
      addItem,
      updateQuantity,
      removeItem,
      clear,
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
