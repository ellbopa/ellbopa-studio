import { ProductType } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { BarChart3, Headphones, Heart, Mail, Play, Search, ShieldCheck, ShoppingBag, Smartphone, Sparkles, Star, Upload, Users, Zap } from "lucide-react";
import { formatDop } from "@/lib/format";
import { getProducts } from "@/lib/products";
import { getSiteConfig } from "@/lib/site-config";

const benefits = [
  [ShieldCheck, "Licencias simples", "Compra clara, derechos visibles y descarga protegida."],
  [ShoppingBag, "Compra segura", "PayPal, transferencia y ordenes guardadas en tu cuenta."],
  [Users, "Comunidad real", "Artistas, productores e ingenieros conectados en RD y fuera."],
  [Headphones, "Sonido profesional", "Beats, presets, sound kits y servicios listos para trabajar."]
];

const genres = ["Hip Hop", "Trap", "R&B", "Dembow", "Pop", "Rock", "Electronica", "Reggaeton"];

const testimonials = [
  ["Tantu", "Productor musical", "Ellbopa me permite enseñar mi catalogo y vender sin complicarme."],
  ["J. Tek", "Artista", "Encuentro beats, servicios y contacto directo con productores reales."],
  ["Homage", "Ingeniero", "La plataforma se siente seria para vender mezcla, mastering y entregas."]
];

export default async function HomePage() {
  const [beats, presets, soundKits] = await Promise.all([
    getProducts(ProductType.BEAT),
    getProducts(ProductType.PRESET),
    getProducts(ProductType.SOUND_KIT),
    getSiteConfig()
  ]);
  const featured = [...beats, ...presets, ...soundKits].slice(0, 8);
  const trending = beats.slice(0, 6);
  const compact = featured.slice(0, 6);

  return (
    <main className="bg-[#030303] text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_14%,var(--brand-glow),transparent_28rem),radial-gradient(circle_at_18%_18%,rgba(255,255,255,.08),transparent_22rem),linear-gradient(180deg,#080808,#030303)]" />
        <div className="cinematic-grid absolute inset-0 opacity-35" />
        <div className="film-grain absolute inset-0 opacity-[0.12]" />
        <div className="relative mx-auto grid min-h-[690px] max-w-[1500px] items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.02fr_0.98fr]">
          <div>
            <p className="mb-5 inline-flex rounded-full border border-[var(--brand-border)] bg-white/[0.055] px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-white/70 shadow-[0_0_34px_var(--brand-glow)]">
              Marketplace musical premium
            </p>
            <h1 className="font-display text-[clamp(3.3rem,7.5vw,7.6rem)] font-black uppercase leading-[0.88]">
              Tu proximo hit
              <span className="block text-studio-red">empieza aqui</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/68">
              Compra y vende beats, presets, sound kits y servicios profesionales. Una plataforma urbana para artistas, productores e ingenieros con identidad Ellbopa Studio.
            </p>
            <form action="/marketplace" className="mt-8 flex max-w-3xl flex-col gap-3 rounded-2xl border border-white/10 bg-white p-3 shadow-[0_30px_100px_rgba(0,0,0,.55)] sm:flex-row">
              <label className="flex min-w-0 flex-1 items-center gap-3 px-2">
                <Search className="shrink-0 text-black/45" />
                <input name="q" placeholder="Que estas buscando?" className="h-12 min-w-0 flex-1 bg-transparent font-semibold text-black outline-none placeholder:text-black/45" />
              </label>
              <button className="rounded-xl bg-studio-red px-7 py-3 font-black text-white glow-button">Buscar</button>
            </form>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/beats" className="rounded-xl bg-studio-red px-6 py-4 font-black text-white glow-button transition hover:scale-[1.02]">Explorar beats</Link>
              <Link href="/dashboard/producer/upload" className="rounded-xl border border-white/15 bg-white/[0.06] px-6 py-4 font-black text-white/88 transition hover:border-[var(--brand-border)]">Empezar a vender</Link>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-4">
              {benefits.map(([Icon, title, text]) => {
                const RealIcon = Icon as typeof ShieldCheck;
                return (
                  <div key={title as string} className="rounded-2xl border border-white/10 bg-black/35 p-4 backdrop-blur-xl">
                    <RealIcon className="mb-3 h-5 w-5 text-studio-red" />
                    <p className="font-black">{title as string}</p>
                    <p className="mt-1 text-xs leading-5 text-white/48">{text as string}</p>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="relative min-h-[520px] overflow-hidden rounded-3xl border border-white/10 bg-black shadow-[0_45px_150px_var(--brand-glow)]">
            <Image src="/images/ellbopa-logo.jpeg" alt="Ellbopa Studio" fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover opacity-55 saturate-150" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_30%,transparent,rgba(0,0,0,.86)_68%),linear-gradient(90deg,rgba(0,0,0,.92),transparent)]" />
            <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/10 bg-black/72 p-5 backdrop-blur-2xl">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-studio-red">Studio / Marketplace</p>
              <h2 className="mt-2 font-display text-3xl font-black">Beats, servicios y comunidad en un solo lugar.</h2>
              <div className="mt-5 h-20 rounded-xl border border-white/10 bg-white/[0.04] p-3">
                <div className="flex h-full items-end gap-1">
                  {Array.from({ length: 42 }).map((_, i) => <span key={i} className="flex-1 rounded-full bg-gradient-to-t from-studio-red to-studio-gold" style={{ height: `${20 + ((i * 17) % 70)}%` }} />)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <MarketplaceSection title="Beats en tendencia" href="/beats">
        {trending.length ? trending.map((beat) => <BeatCard key={beat.id} product={beat} />) : <EmptyMarketplaceCard />}
      </MarketplaceSection>

      <section className="mx-auto grid max-w-[1500px] gap-8 border-b border-white/10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_420px]">
        <div>
          <SectionHeader title="Explorar por genero" href="/marketplace" />
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {genres.map((genre, index) => (
              <Link key={genre} href={`/marketplace?genre=${encodeURIComponent(genre)}`} className="group relative min-h-44 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:-translate-y-1 hover:border-[var(--brand-border)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_45%_30%,var(--brand-glow),transparent_65%),linear-gradient(180deg,transparent,rgba(0,0,0,.86))]" />
                <div className="absolute inset-0 opacity-40" style={{ backgroundImage: `linear-gradient(${110 + index * 15}deg, transparent, var(--brand-primary))` }} />
                <p className="relative mt-28 font-display text-xl font-black">{genre}</p>
              </Link>
            ))}
          </div>
        </div>
        <div>
          <SectionHeader title="Nuevos y destacados" href="/marketplace" />
          <div className="mt-6 grid gap-3">
            {compact.length ? compact.map((item) => <CompactProduct key={item.id} product={item} />) : <div className="rounded-2xl border border-white/10 bg-black/35 p-5 text-sm text-white/55">Cuando subas productos reales, apareceran aqui.</div>}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] border-b border-white/10 px-4 py-14 sm:px-6">
        <SectionHeader title="Lo que dicen nuestros creadores" href="/comunidad" />
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {testimonials.map(([name, role, quote]) => (
            <article key={name} className="premium-card rounded-2xl p-6">
              <p className="text-4xl font-black text-studio-red">“</p>
              <p className="mt-2 leading-7 text-white/72">{quote}</p>
              <div className="mt-6 flex items-center justify-between gap-4">
                <div>
                  <p className="font-black">{name}</p>
                  <p className="text-sm text-white/45">{role}</p>
                </div>
                <div className="flex text-studio-red">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}</div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-[1500px] gap-8 border-b border-white/10 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-studio-red">Para productores</p>
          <h2 className="mt-3 font-display text-5xl font-black leading-none">Tu negocio musical en un solo lugar</h2>
          <p className="mt-5 max-w-xl leading-7 text-white/62">Sube beats, presets y sound kits. Mira ventas, clientes, analytics y rendimiento desde tu dashboard.</p>
          <Link href="/dashboard/producer" className="mt-8 inline-flex rounded-xl bg-studio-red px-6 py-4 font-black text-white glow-button">Mas informacion</Link>
        </div>
        <div className="premium-card rounded-3xl p-5">
          <div className="grid gap-4 md:grid-cols-3">
            <AdminMini icon={BarChart3} title="Analytics" value="Realtime" />
            <AdminMini icon={Upload} title="Uploads" value="Gratis" />
            <AdminMini icon={Zap} title="Ventas" value="80%" />
          </div>
          <div className="mt-5 h-64 rounded-2xl border border-white/10 bg-black/45 p-5">
            <div className="flex h-full items-end gap-2">
              {Array.from({ length: 18 }).map((_, i) => <span key={i} className="flex-1 rounded-t-xl bg-gradient-to-t from-studio-red to-studio-gold" style={{ height: `${24 + ((i * 23) % 72)}%` }} />)}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1500px] gap-8 border-b border-white/10 px-4 py-16 sm:px-6 lg:grid-cols-[0.8fr_1fr]">
        <div className="relative mx-auto h-[520px] w-[260px] rounded-[2.5rem] border border-white/15 bg-black p-4 shadow-[0_40px_120px_var(--brand-glow)]">
          <div className="h-full rounded-[2rem] border border-white/10 bg-[#101010] p-4">
            <div className="mb-5 h-2 w-20 rounded-full bg-white/15" />
            <div className="space-y-3">
              {compact.slice(0, 5).map((item) => <div key={item.id} className="flex items-center gap-3 rounded-xl bg-white/[0.06] p-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-studio-red"><Play className="h-4 w-4 fill-current" /></span><span className="line-clamp-1 text-sm font-bold">{item.title}</span></div>)}
            </div>
          </div>
        </div>
        <div className="self-center">
          <Smartphone className="mb-5 h-10 w-10 text-studio-red" />
          <h2 className="font-display text-5xl font-black leading-none">Lleva tus beats a todas partes</h2>
          <p className="mt-5 max-w-2xl leading-7 text-white/62">Compra, vende, recibe mensajes y revisa tus ordenes desde cualquier dispositivo con experiencia responsive premium.</p>
          <form className="mt-8 flex max-w-xl flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-3 sm:flex-row">
            <label className="flex flex-1 items-center gap-3 px-3"><Mail className="text-white/40" /><input placeholder="Ingresa tu email" className="h-12 flex-1 bg-transparent outline-none placeholder:text-white/35" /></label>
            <button className="rounded-xl bg-studio-red px-6 py-3 font-black text-white glow-button">Suscribirme</button>
          </form>
        </div>
      </section>
    </main>
  );
}

function MarketplaceSection({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  return <section className="mx-auto max-w-[1500px] border-b border-white/10 px-4 py-12 sm:px-6"><SectionHeader title={title} href={href} /><div className="no-scrollbar mt-6 flex gap-5 overflow-x-auto pb-2">{children}</div></section>;
}

function SectionHeader({ title, href }: { title: string; href: string }) {
  return <div className="flex items-center justify-between gap-4"><h2 className="font-display text-3xl font-black">{title}</h2><Link href={href} className="text-sm font-black text-studio-red">Ver mas</Link></div>;
}

function BeatCard({ product }: { product: any }) {
  return <article className="group w-[230px] shrink-0"><Link href={`/checkout?productId=${encodeURIComponent(product.id)}`} className="relative block aspect-square overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]"><Image src={product.imageUrl || "/images/beat-cover.svg"} alt={product.title} fill sizes="230px" className="object-cover transition duration-500 group-hover:scale-105" /><span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-black/70 text-white"><Heart className="h-4 w-4" /></span><span className="absolute inset-0 grid place-items-center bg-black/10 opacity-0 transition group-hover:opacity-100"><span className="grid h-14 w-14 place-items-center rounded-full bg-white text-black"><Play className="ml-1 h-6 w-6 fill-current" /></span></span></Link><h3 className="mt-4 line-clamp-1 font-display text-xl font-black">{product.title}</h3><p className="mt-1 text-sm text-white/48">{product.owner?.name || "Ellbopa Studio"}</p><p className="mt-1 text-xs text-white/40">{product.genre || "Urban"} / {product.bpm || "--"} BPM</p><Link href={`/checkout?productId=${encodeURIComponent(product.id)}`} className="mt-4 flex h-12 items-center justify-center gap-2 rounded-xl border border-[var(--brand-border)] bg-black font-black text-white transition hover:bg-studio-red"><ShoppingBag className="h-4 w-4" /> {formatDop(product.price)}</Link></article>;
}

function CompactProduct({ product }: { product: any }) {
  return <Link href={`/checkout?productId=${encodeURIComponent(product.id)}`} className="grid grid-cols-[44px_1fr_auto] items-center gap-3 rounded-2xl border border-white/10 bg-black/35 p-3 transition hover:border-[var(--brand-border)]"><span className="grid h-11 w-11 place-items-center rounded-full bg-studio-red"><Play className="h-4 w-4 fill-current" /></span><span className="min-w-0"><span className="block truncate font-bold">{product.title}</span><span className="block text-xs text-white/45">{product.type} / {product.genre || "Urban"}</span></span><span className="font-black text-studio-gold">{formatDop(product.price)}</span></Link>;
}

function EmptyMarketplaceCard() {
  return <div className="min-w-[320px] rounded-3xl border border-dashed border-[var(--brand-border)] bg-white/[0.035] p-8"><Sparkles className="mb-4 h-8 w-8 text-studio-red" /><h3 className="font-display text-2xl font-black">Marketplace listo para tu primer beat</h3><p className="mt-3 text-sm leading-6 text-white/58">No hay productos publicados. Sube contenido real desde el dashboard y aparecera aqui automaticamente.</p><Link href="/dashboard/producer/upload" className="mt-6 inline-flex rounded-xl bg-studio-red px-5 py-3 font-black text-white glow-button">Subir beat</Link></div>;
}

function AdminMini({ icon: Icon, title, value }: { icon: any; title: string; value: string }) {
  return <div className="rounded-2xl border border-white/10 bg-black/35 p-4"><Icon className="mb-4 h-6 w-6 text-studio-red" /><p className="text-sm text-white/45">{title}</p><p className="font-display text-3xl font-black">{value}</p></div>;
}

