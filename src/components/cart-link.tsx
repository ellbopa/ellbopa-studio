"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { cartStorageKey } from "@/lib/cart";

export function CartLink() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const update = () => {
      try {
        const items = JSON.parse(window.localStorage.getItem(cartStorageKey) || "[]") as Array<unknown>;
        setCount(items.length);
      } catch {
        setCount(0);
      }
    };

    update();
    window.addEventListener("storage", update);
    window.addEventListener("ellbopa-cart-updated", update);
    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("ellbopa-cart-updated", update);
    };
  }, []);

  return (
    <Link
      href="/carrito"
      className="relative grid h-10 w-10 place-items-center rounded-md border border-white/10 bg-white/[0.045] text-white/78 transition hover:border-studio-red/45 hover:text-white hover:shadow-[0_0_24px_rgba(229,9,20,.18)]"
      aria-label="Carrito"
    >
      <ShoppingCart size={18} />
      {count > 0 ? (
        <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-studio-red px-1 text-[11px] font-black text-white shadow-glow">
          {count}
        </span>
      ) : null}
    </Link>
  );
}
