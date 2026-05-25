import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, Heart, ShieldCheck, ShoppingBag, Star } from "lucide-react";
import { getProducts } from "@/lib/products";
import { formatDop } from "@/lib/format";
import { getLicenseOptions } from "@/lib/licensing";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { Waveform } from "@/components/waveform";
import { AudioPreviewPlayer } from "@/components/audio-preview-player";

type ProductPageProps = { params: Promise<{ id: string }> };

async function loadProduct(id: string) {
  const products = await getProducts();
  return products.find((product) => product.id === id || getSlug(product) === id);
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await loadProduct(id);
  if (!product) return { title: "Producto no encontrado" };
  return {
    title: product.title,
    description: product.description,
    openGraph: {
      title: `${product.title} | Ellbopa Music`,
      description: product.description,
      images: product.imageUrl ? [product.imageUrl] : ["/images/ellbopa-logo.jpeg"]
    }
  };
}

function getSlug(product: unknown) {
  const item = product as { id: string; slug?: string | null };
  return item.slug || item.id;
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await loadProduct(id);
  if (!product) notFound();

  const licenses = product.type === "BEAT" ? getLicenseOptions(product) : [];
  const related = (await getProducts()).filter((item) => item.id !== product.id && (item.genre === product.genre || item.type === product.type)).slice(0, 4);

  return (
    <main className="pb-20">
      <section className="relative overflow-hidden border-b border-white/10 bg-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(229,9,20,.25),transparent_28rem),radial-gradient(circle_at_75%_0%,rgba(217,164,65,.12),transparent_24rem)]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="relative mx-auto aspect-square w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-[0_40px_140px_rgba(0,0,0,.45)]">
            <Image src={product.imageUrl || "/images/beat-cover.svg"} alt={product.title} fill sizes="(min-width:1024px) 40vw, 90vw" className="object-contain p-6" priority />
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-[0.26em] text-studio-gold">{product.type} / {product.genre || "Ellbopa"}</p>
            <h1 className="mt-4 font-display text-5xl font-black uppercase leading-[0.92] sm:text-7xl">{product.title}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/62">{product.description}</p>
            <div className="mt-5 flex flex-wrap gap-2 text-sm text-white/62">
              {product.bpm ? <span className="rounded-xl bg-white/10 px-3 py-2">{product.bpm} BPM</span> : null}
              {product.musicalKey ? <span className="rounded-xl bg-white/10 px-3 py-2">{product.musicalKey}</span> : null}
              {product.mood ? <span className="rounded-xl bg-white/10 px-3 py-2">{product.mood}</span> : null}
              <span className="rounded-xl bg-white/10 px-3 py-2">Entrega digital privada</span>
            </div>
            <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.045] p-5">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm font-black">Preview seguro</p>
                  <Waveform active />
                </div>
              </div>
              {product.audioUrl ? <div className="mt-4"><AudioPreviewPlayer audioUrl={product.audioUrl} title={product.title} /></div> : null}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {licenses.length > 0 ? (
            <section className="premium-card rounded-3xl p-6">
              <h2 className="font-display text-3xl font-black">Licencias</h2>
              <div className="mt-5 grid gap-4 lg:grid-cols-3">
                {licenses.map((license) => (
                  <form key={license.key} action="/api/checkout" method="POST" className={`rounded-2xl border p-5 ${license.featured ? "border-studio-gold/45 bg-studio-gold/10" : "border-white/10 bg-black/35"}`}>
                    <input type="hidden" name="productId" value={product.id} />
                    <input type="hidden" name="mode" value="full" />
                    <input type="hidden" name="license" value={license.key} />
                    <h3 className="font-display text-2xl font-black">{license.title}</h3>
                    <p className="mt-2 text-sm text-white/55">{license.files}</p>
                    <p className="mt-4 font-display text-3xl font-black text-studio-gold">{formatDop(license.price)}</p>
                    <ul className="mt-4 space-y-2 text-sm text-white/58">
                      {license.terms.map((term) => <li key={term} className="flex gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 text-studio-gold" />{term}</li>)}
                    </ul>
                    <button className="mt-5 w-full rounded-xl bg-studio-red px-4 py-3 text-sm font-black glow-button">Comprar ahora</button>
                  </form>
                ))}
              </div>
            </section>
          ) : null}

          <section className="premium-card rounded-3xl p-6">
            <h2 className="font-display text-3xl font-black">Relacionado</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item) => (
                <Link key={item.id} href={`/producto/${encodeURIComponent(item.id)}`} className="rounded-2xl border border-white/10 bg-black/35 p-3 transition hover:border-studio-red/35">
                  <div className="relative aspect-square rounded-xl bg-white/[0.04]">
                    <Image src={item.imageUrl || "/images/beat-cover.svg"} alt={item.title} fill className="object-contain p-3" />
                  </div>
                  <p className="mt-3 truncate font-black">{item.title}</p>
                  <p className="text-sm text-studio-gold">{formatDop(item.price)}</p>
                </Link>
              ))}
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-3xl border border-white/10 bg-white/[0.045] p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/55">Precio desde</p>
            <span className="flex items-center gap-1 text-studio-gold"><Star className="h-4 w-4 fill-current" /> Premium</span>
          </div>
          <p className="mt-2 font-display text-4xl font-black text-studio-gold">{formatDop(product.price)}</p>
          <div className="mt-5 grid gap-3">
            <AddToCartButton item={{ id: product.id, title: product.title, type: product.type, price: product.price, imageUrl: product.imageUrl, audioUrl: product.audioUrl, genre: product.genre }} />
            <Link href={`/checkout?productId=${encodeURIComponent(product.id)}`} className="flex items-center justify-center gap-2 rounded-xl bg-studio-red px-5 py-3 font-black glow-button"><ShoppingBag className="h-4 w-4" /> Comprar</Link>
            <form action="/api/favorites" method="POST">
              <input type="hidden" name="productId" value={product.id} />
              <input type="hidden" name="next" value={`/producto/${product.id}`} />
              <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-5 py-3 font-black text-white/72"><Heart className="h-4 w-4" /> Guardar favorito</button>
            </form>
            {product.fileUrl ? <p className="flex items-center gap-2 text-sm text-white/48"><Download className="h-4 w-4" /> Descarga privada despues del pago.</p> : null}
          </div>
        </aside>
      </section>
    </main>
  );
}
