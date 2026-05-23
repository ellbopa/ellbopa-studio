"use client";

import { useEffect } from "react";
import { cartStorageKey } from "@/lib/cart";

export function ClearCartOnSuccess() {
  useEffect(() => {
    window.localStorage.removeItem(cartStorageKey);
    window.dispatchEvent(new CustomEvent("ellbopa-cart-updated", { detail: 0 }));
  }, []);

  return null;
}
