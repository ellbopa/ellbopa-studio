"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CreditCard, Landmark, ShoppingBag, Trash2 } from "lucide-react";
import { cartStorageKey, type CartItem } from "@/lib/cart";
import { formatDop } from "@/lib/format";

export function CartPageClient() {
  const [items, setItems] = useState<CartItem[]>([]);
  const total = useMemo(() => items.reduce((sum, item) => sum + Number(item.price || 0), 0), [items]);

  useEffect(() => {
    setItems(readCart());
  }, []);

  const save = (next: CartItem[]) => {
    setItems(next);
    window.localStorage.setItem(cartStorageKey, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("ellbopa-cart-updated", { detail: next.length }));
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-studio-gold">Checkout</p>
          <h1 className="mt-3 font-display text-4xl font-black sm:text-6xl">Tu carrito Ellbopa</h1>
          <p className="mt-3 max-w-2xl text-white/58">
            Compra beats, presets y archivos digitales. Si pagas por transferencia, la orden queda pendiente hasta que el admin confirme el comprobante.
          </p>
        </div>
        <Link href="/beats" className="rounded-md border border-white/10 bg-white/[0.045] px-5 py-3 text-sm font-bold text-white/72 transition hover:border-studio-red/40 hover:text-white">
          Seguir comprando
        </Link>
      </div>

      {items.length === 0 ? (
        <section className="premium-card rounded-lg p-8 text-center">
          <ShoppingBag className="mx-auto text-studio-gold" size={52} />
          <h2 className="mt-5 font-display text-3xl font-black">Tu carrito esta vacio</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/58">Agrega beats o presets para crear una compra completa.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/beats" className="rounded-md bg-studio-red px-5 py-3 font-bold glow-button">Ver beats</Link>
            <Link href="/presets" className="rounded-md border border-studio-gold/30 px-5 py-3 font-bold text-studio-gold">Ver presets</Link>
          </div>
        </section>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <section className="premium-card rounded-lg p-5">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
              <h2 className="font-display text-2xl font-bold">Productos</h2>
              <button type="button" onClick={() => save([])} className="inline-flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm text-white/58 transition hover:border-studio-red/40 hover:text-white">
                <Trash2 size={15} /> Vaciar
              </button>
            </div>
            <div className="mt-5 space-y-4">
              {items.map((item) => (
                <article key={item.id} className="grid gap-4 rounded-md border border-white/10 bg-black/45 p-4 sm:grid-cols-[90px_1fr_auto] sm:items-center">
                  <div className="relative aspect-square overflow-hidden rounded-md border border-white/10 bg-studio-smoke">
                    <Image src={item.imageUrl || "/images/beat-cover.svg"} alt={item.title} fill sizes="90px" className="object-contain p-2" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.18em] text-studio-gold">{item.type}</p>
                    <h3 className="mt-1 truncate font-display text-2xl font-black">{item.title}</h3>
                    <p className="mt-1 text-sm text-white/50">{item.licenseLabel || item.genre || "Producto digital Ellbopa"}</p>
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                    <strong className="text-lg text-studio-gold">{formatDop(item.price)}</strong>
                    <button type="button" onClick={() => save(items.filter((current) => current.id !== item.id))} className="rounded-md border border-white/10 px-3 py-2 text-sm text-white/55 hover:border-studio-red/40 hover:text-white">
                      Quitar
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <aside className="premium-card h-fit rounded-lg p-6">
            <h2 className="font-display text-2xl font-bold">Resumen</h2>
            <div className="mt-5 space-y-3 border-b border-white/10 pb-5 text-sm text-white/65">
              <div className="flex justify-between"><span>Productos</span><span>{items.length}</span></div>
              <div className="flex justify-between"><span>Entrega digital</span><span>Despues del pago</span></div>
              <div className="flex justify-between"><span>Total</span><strong className="text-studio-gold">{formatDop(total)}</strong></div>
            </div>

            <form action="/api/checkout" method="POST" className="mt-5 space-y-4">
              <input type="hidden" name="cartJson" value={JSON.stringify(items)} />
              <input type="hidden" name="mode" value="full" />
              <button name="paymentMethod" value="paypal" className="flex w-full items-center justify-center gap-2 rounded-md border border-blue-400/45 bg-blue-500/10 px-5 py-3 font-black text-blue-100 transition hover:bg-blue-600 hover:text-white">
                <CreditCard size={18} /> Pagar con PayPal
              </button>
              <button name="paymentMethod" value="transfer" className="flex w-full items-center justify-center gap-2 rounded-md border border-studio-gold/35 bg-studio-gold/10 px-5 py-3 font-black text-studio-gold transition hover:bg-studio-gold hover:text-black">
                <Landmark size={18} /> Pagar por transferencia
              </button>
            </form>

            <p className="mt-4 rounded-md border border-white/10 bg-black/35 p-4 text-xs leading-6 text-white/50">
              Para productos digitales, el admin puede liberar los archivos finales cuando el pago este confirmado. Las compras por transferencia quedan pendientes.
            </p>
          </aside>
        </div>
      )}
    </main>
  );
}

function readCart(): CartItem[] {
  try {
    return JSON.parse(window.localStorage.getItem(cartStorageKey) || "[]") as CartItem[];
  } catch {
    return [];
  }
}
