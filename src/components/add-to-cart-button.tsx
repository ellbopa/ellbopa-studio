"use client";

import { useState } from "react";
import { Check, ShoppingCart } from "lucide-react";
import { cartStorageKey, type CartItem } from "@/lib/cart";

export function AddToCartButton({ item, compact = false }: { item: CartItem; compact?: boolean }) {
  const [added, setAdded] = useState(false);

  const addToCart = () => {
    const current = readCart();
    const next = current.some((cartItem) => cartItem.id === item.id) ? current : [item, ...current];
    window.localStorage.setItem(cartStorageKey, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("ellbopa-cart-updated", { detail: next.length }));
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  };

  return (
    <button
      type="button"
      onClick={addToCart}
      className={
        compact
          ? "grid h-11 w-11 place-items-center rounded-md border border-white/10 bg-white/8 text-white/75 transition hover:border-studio-gold/45 hover:text-studio-gold"
          : "flex w-full items-center justify-center gap-2 rounded-md border border-studio-gold/35 bg-studio-gold/10 px-4 py-3 text-sm font-black text-studio-gold transition hover:bg-studio-gold hover:text-black"
      }
      aria-label={added ? "Agregado al carrito" : "Agregar al carrito"}
    >
      {added ? <Check size={16} /> : <ShoppingCart size={16} />}
      {compact ? null : added ? "Agregado" : "Agregar al carrito"}
    </button>
  );
}

function readCart(): CartItem[] {
  try {
    return JSON.parse(window.localStorage.getItem(cartStorageKey) || "[]") as CartItem[];
  } catch {
    return [];
  }
}
