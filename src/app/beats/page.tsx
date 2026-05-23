import { ProductType } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { Grid3X3, Heart, List, Music2, Search, SlidersHorizontal } from "lucide-react";
import { BeatCard } from "@/components/beat-card";
import { getProducts } from "@/lib/products";
import { formatDop } from "@/lib/format";

export const metadata = { title: "Instrumentales Store" };

type BeatsSearchParams = { q?: string; genre?: string; mood?: string; key?: string; sort?: string };

export default async function BeatsPage({ searchParams }: { searchParams?: Promise<BeatsSearchParams> }) {
  const params = (await searchParams) ?? {};
  const allBeats = await getProducts(ProductType.BEAT);
  const query = (params.q || "").trim().toLowerCase();
  const beats = allBeats
    .filter((beat) => {
      if (!query) return true;
      return [beat.title, beat.genre, beat.mood, beat.musicalKey, String(beat.bpm ?? "")]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);
    })
    .sort((a, b) => {
      if (params.sort === "price-low") return a.price - b.price;
      if (params.sort === "price-high") return b.price - a.price;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  const current = beats[0];

  return (
    <main className="pb-32">
      <section className="relative overflow-hidden border-b border-white/10 bg-black/70 backdrop-blur-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(229,9,20,.16),transparent_22rem),radial-gradient(circle_at_76%_0%,rgba(217,164,65,.09),transparent_20rem)]" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-studio-red shadow-glow">
              <Music2 size={22} />
            </span>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-studio-gold">Ellbopa Instrumentales</p>
              <h1 className="font-display text-2xl font-black">Explora Instrumentales</h1>
            </div>
          </div>
          <form action="/beats" className="group relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/38" size={20} />
            <input
              name="q"
              defaultValue={params.q || ""}
              placeholder="Busca beats, BPM, mood, genero o tono"
              className="w-full rounded-md border border-white/10 bg-white/[0.07] py-4 pl-12 pr-4 text-sm text-white shadow-[0_16px_45px_rgba(0,0,0,.22)] outline-none backdrop-blur-xl transition group-hover:border-studio-red/30 focus:border-studio-red/60 focus:shadow-[0_0_40px_rgba(229,9,20,.15)]"
            />
          </form>
          <div className="flex gap-2">
            <a href="/registro" className="rounded-md border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold text-white/72 transition hover:border-studio-gold/40 hover:text-white">Sign up</a>
            <a href="/login" className="premium-action rounded-md bg-studio-red px-4 py-3 text-sm font-bold text-white glow-button">Sign in</a>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-white/[0.035] backdrop-blur-xl">
        <div className="no-scrollbar mx-auto flex max-w-7xl gap-8 overflow-x-auto px-4 py-4 text-sm font-bold text-white/68 sm:px-6">
          {["Tracks", "Collections", "Sound Kits", "Musicians", "AI Models"].map((tab, index) => (
            <span key={tab} className={index === 0 ? "text-white" : ""}>{tab}</span>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-7 sm:px-6">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="no-scrollbar flex gap-3 overflow-x-auto">
            {["All time", "Genre", "Track Type", "Price", "Mood", "BPM", "Instruments", "Key", "Duration", "Energy", "Vocals"].map((filter) => (
              <a key={filter} href={filter === "Price" ? "/beats?sort=price-low" : "/beats"} className="shrink-0 rounded-md border border-white/10 bg-black/70 px-4 py-3 text-sm font-bold text-white/70 shadow-[0_10px_30px_rgba(0,0,0,.18)] transition hover:-translate-y-0.5 hover:border-studio-red/45 hover:text-white hover:shadow-[0_0_28px_rgba(229,9,20,.12)]">
                {filter}
              </a>
            ))}
          </div>
          <div className="flex gap-2">
            <button className="grid h-11 w-11 place-items-center rounded-full bg-white/8 text-white/70"><Heart size={18} /></button>
            <button className="grid h-11 w-11 place-items-center rounded-md bg-white/8 text-white/70"><List size={18} /></button>
            <button className="grid h-11 w-11 place-items-center rounded-md bg-white/12 text-white"><Grid3X3 size={18} /></button>
            <button className="grid h-11 w-11 place-items-center rounded-md bg-white/8 text-white/70"><SlidersHorizontal size={18} /></button>
          </div>
        </div>

        <div className="grid gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {beats.length === 0 ? (
            <div className="premium-card rounded-lg p-8 text-white/70 sm:col-span-2 lg:col-span-3 xl:col-span-5">
              No encontre instrumentales con esa busqueda. Prueba con Trap, Dembow, R&B, Detroit, BPM o mood.
            </div>
          ) : null}
          {beats.map((product, index) => <BeatCard key={`${product.id}-${index}`} product={product} index={index} />)}
        </div>
      </section>

      {current ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-black/86 shadow-[0_-24px_80px_rgba(0,0,0,.55)] backdrop-blur-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_0%,rgba(229,9,20,.18),transparent_26rem)]" />
          <div className="relative mx-auto grid max-w-7xl gap-3 px-4 py-3 sm:px-6 lg:grid-cols-[260px_1fr_260px] lg:items-center">
            <div className="flex items-center gap-3">
              <div className="relative h-14 w-14 overflow-hidden rounded-md">
                <Image src={current.imageUrl || "/images/beat-cover.svg"} alt={current.title} fill sizes="56px" className="object-cover" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-black">{current.title}</p>
                <p className="truncate text-xs text-white/50">Ellbopa / {current.bpm || 120} BPM</p>
              </div>
            </div>
            <div className="hidden h-10 items-end gap-px lg:flex">
              {Array.from({ length: 96 }).map((_, index) => (
                <span key={index} className="w-1 rounded-t bg-gradient-to-t from-studio-red/70 to-studio-gold/70 shadow-[0_0_10px_rgba(229,9,20,.22)]" style={{ height: `${10 + ((index * 17) % 30)}px` }} />
              ))}
            </div>
            <div className="flex items-center justify-end gap-3">
              <span className="text-sm font-bold text-white/62">{current.musicalKey || "Fm"}</span>
              <Link href={`/checkout?productId=${encodeURIComponent(current.id)}`} className="premium-action rounded-md bg-studio-red px-5 py-3 text-sm font-black text-white glow-button">
                {formatDop(current.price)}
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
