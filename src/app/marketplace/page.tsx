import { ProductType } from "@prisma/client";
import Link from "next/link";
import { Filter, Search, SlidersHorizontal } from "lucide-react";
import { BeatCard } from "@/components/beat-card";
import { PresetCard } from "@/components/preset-card";
import { getProducts } from "@/lib/products";
import { auth } from "@/lib/auth";
import { getFavoriteIds } from "@/lib/favorites";

export const metadata = {
  title: "Marketplace Musical",
  description: "Beats, presets, sound kits y servicios premium de Ellbopa Music."
};

type MarketplaceParams = {
  q?: string;
  type?: string;
  genre?: string;
  key?: string;
  price?: string;
  sort?: string;
};

export default async function MarketplacePage({ searchParams }: { searchParams?: Promise<MarketplaceParams> }) {
  const params = (await searchParams) ?? {};
  const [products, session] = await Promise.all([getProducts(), auth()]);
  const favoriteIds = await getFavoriteIds(session?.user?.id);
  const query = (params.q || "").trim().toLowerCase();
  const type = (params.type || "all").toUpperCase();
  const maxPrice = params.price ? Number(params.price) : null;

  const filtered = products
    .filter((product) => type === "ALL" || type === "all".toUpperCase() || product.type === type)
    .filter((product) => !params.genre || product.genre?.toLowerCase().includes(params.genre.toLowerCase()))
    .filter((product) => !params.key || product.musicalKey?.toLowerCase() === params.key.toLowerCase())
    .filter((product) => !maxPrice || product.price <= maxPrice)
    .filter((product) => {
      if (!query) return true;
      return [product.title, product.description, product.genre, product.mood, product.musicalKey, String(product.bpm ?? "")]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);
    })
    .sort((a, b) => {
      if (params.sort === "price-low") return a.price - b.price;
      if (params.sort === "price-high") return b.price - a.price;
      return getPopularity(b) - getPopularity(a) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <main className="pb-20">
      <section className="border-b border-white/10 bg-black/82">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-studio-gold">Marketplace Ellbopa</p>
            <h1 className="mt-3 font-display text-5xl font-black uppercase leading-[0.95]">Compra sonido listo para lanzar.</h1>
            <p className="mt-4 text-white/58">Instrumentales, presets, sound kits y servicios con compra protegida, descargas privadas y licencias claras.</p>
          </div>
          <form action="/marketplace" className="rounded-2xl border border-white/10 bg-white/[0.055] p-3 shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
            <div className="flex items-center gap-3">
              <Search className="ml-2 h-5 w-5 text-white/45" />
              <input name="q" defaultValue={params.q || ""} className="h-12 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-white/35" placeholder="Busca por genero, BPM, key, mood o producto" />
              <button className="rounded-xl bg-studio-red px-5 py-3 text-sm font-black glow-button">Buscar</button>
            </div>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-7 sm:px-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="no-scrollbar flex gap-2 overflow-x-auto">
            {[
              ["Todo", "/marketplace"],
              ["Beats", "/marketplace?type=BEAT"],
              ["Presets", "/marketplace?type=PRESET"],
              ["Sound Kits", "/marketplace?type=SOUND_KIT"],
              ["Servicios", "/marketplace?type=SERVICE"]
            ].map(([label, href]) => (
              <Link key={href} href={href} className="shrink-0 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-black text-white/70 transition hover:border-studio-red/45 hover:text-white">
                {label}
              </Link>
            ))}
          </div>
          <div className="flex gap-2 text-sm text-white/58">
            <Link href="/marketplace?sort=price-low" className="rounded-xl border border-white/10 bg-black/45 px-4 py-3"><Filter className="mr-2 inline h-4 w-4" />Menor precio</Link>
            <Link href="/marketplace?sort=price-high" className="rounded-xl border border-white/10 bg-black/45 px-4 py-3"><SlidersHorizontal className="mr-2 inline h-4 w-4" />Mayor precio</Link>
          </div>
        </div>

        <div className="mt-8 grid gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {filtered.length === 0 ? <div className="premium-card rounded-lg p-8 text-white/70 sm:col-span-2 lg:col-span-3 xl:col-span-5">No hay resultados con esos filtros.</div> : null}
          {filtered.map((product, index) => (
            product.type === ProductType.BEAT ? (
              <BeatCard key={product.id} product={product} index={index} isFavorite={favoriteIds.has(product.id)} />
            ) : (
              <PresetCard key={product.id} product={product} />
            )
          ))}
        </div>
      </section>
    </main>
  );
}

function getPopularity(product: unknown) {
  return Number((product as { popularity?: number | null }).popularity || 0);
}
