import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Instagram, Link as LinkIcon, MapPin, MessageCircle, Music2, ShieldCheck, Star, Users } from "lucide-react";
import { getPublicProfile } from "@/lib/public-profiles";
import { getProducts } from "@/lib/products";
import { formatDop, whatsappUrl } from "@/lib/format";
import { getSiteConfig } from "@/lib/site-config";

type ProfilePageProps = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const profile = await getPublicProfile(username);
  if (!profile) return { title: "Perfil no encontrado" };
  return {
    title: `${profile.name} | Perfil musical`,
    description: profile.bio,
    openGraph: {
      title: `${profile.name} en Ellbopa Music`,
      description: profile.bio,
      images: profile.image ? [profile.image] : ["/images/ellbopa-logo.jpeg"]
    }
  };
}

export default async function PublicProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const [profile, products, config] = await Promise.all([getPublicProfile(username), getProducts(), getSiteConfig()]);
  if (!profile) notFound();

  const catalog = products.slice(0, 8);

  return (
    <main className="pb-20">
      <section className="relative overflow-hidden border-b border-white/10 bg-black">
        <div className="absolute inset-0 opacity-35">
          <Image src={profile.bannerImage || "/images/beat-cover.svg"} alt="" fill className="object-cover blur-sm" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/45" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-end">
            <div className="relative size-32 overflow-hidden rounded-3xl border border-white/15 bg-studio-red shadow-glow">
              <Image src={profile.image || "/images/ellbopa-logo.jpeg"} alt={profile.name} fill className="object-cover" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-black uppercase tracking-[0.24em] text-studio-gold">{profile.role}</p>
              <h1 className="mt-3 flex flex-wrap items-center gap-3 font-display text-5xl font-black uppercase leading-[0.92] sm:text-7xl">
                {profile.name}
                {profile.verified ? <ShieldCheck className="h-8 w-8 fill-blue-500 text-blue-500" /> : null}
              </h1>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-white/68">{profile.bio}</p>
              <div className="mt-5 flex flex-wrap gap-3 text-sm text-white/58">
                <span className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2"><MapPin className="h-4 w-4 text-studio-gold" /> {profile.location}</span>
                <span className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2"><Users className="h-4 w-4 text-studio-gold" /> {profile.stats.followers} seguidores</span>
                <span className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2"><Music2 className="h-4 w-4 text-studio-gold" /> {profile.stats.products} productos</span>
                <span className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2"><Star className="h-4 w-4 text-studio-gold" /> {profile.stats.reviews} reviews</span>
              </div>
            </div>
            <div className="grid gap-3">
              <a href={whatsappUrl(`Quiero contactar a ${profile.name} desde Ellbopa Music.`, config.whatsapp)} target="_blank" rel="noreferrer" className="rounded-xl bg-studio-red px-5 py-3 text-center text-sm font-black glow-button"><MessageCircle className="mr-2 inline h-4 w-4" /> Contactar</a>
              {profile.instagram ? <a href={profile.instagram} target="_blank" rel="noreferrer" className="rounded-xl border border-white/10 px-5 py-3 text-center text-sm font-bold text-white/72"><Instagram className="mr-2 inline h-4 w-4" /> Instagram</a> : null}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div>
            <h2 className="font-display text-3xl font-black">Catalogo destacado</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {catalog.map((product) => (
                <Link key={product.id} href={`/producto/${encodeURIComponent(product.id)}`} className="premium-card rounded-2xl p-4 transition hover:-translate-y-1 hover:border-studio-red/35">
                  <div className="relative aspect-square rounded-xl bg-black/35">
                    <Image src={product.imageUrl || "/images/beat-cover.svg"} alt={product.title} fill className="object-contain p-4" />
                  </div>
                  <p className="mt-3 truncate font-black">{product.title}</p>
                  <p className="mt-1 text-sm text-white/45">{product.type} / {product.genre || "Urbano"}</p>
                  <p className="mt-2 font-black text-studio-gold">{formatDop(product.price)}</p>
                </Link>
              ))}
            </div>
          </div>
          <aside className="h-fit rounded-2xl border border-white/10 bg-white/[0.045] p-5">
            <h2 className="font-display text-2xl font-black">Links</h2>
            <div className="mt-4 grid gap-2">
              {[
                ["YouTube", profile.youtube],
                ["Spotify", profile.spotify],
                ["TikTok", profile.tiktok],
                ["Website", profile.website]
              ].filter(([, href]) => href).map(([label, href]) => (
                <a key={label} href={href || "#"} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-bold text-white/70 hover:text-white">
                  {label}<LinkIcon className="h-4 w-4 text-studio-gold" />
                </a>
              ))}
              <Link href="/comunidad" className="rounded-xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-bold text-white/70">Ver comunidad</Link>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
