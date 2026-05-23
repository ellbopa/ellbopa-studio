import { ProductType } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Headphones,
  Heart,
  Mic2,
  Play,
  Radio,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  ShoppingBag,
  UploadCloud,
  Waves
} from "lucide-react";
import { CtaButton } from "@/components/cta-button";
import { AnimatedStat, MotionBlock } from "@/components/motion-block";
import { Section } from "@/components/section";
import { Waveform } from "@/components/waveform";
import { formatDop, whatsappUrl } from "@/lib/format";
import { packages, services } from "@/lib/demo-data";
import { getProducts } from "@/lib/products";
import { getSiteConfig } from "@/lib/site-config";

const artistProof = [
  {
    name: "La Nueva Ola",
    tag: "Trap / R&B",
    quote: "La voz salio grande, clara y lista para plataforma.",
    plays: "218K"
  },
  {
    name: "Los Mina Files",
    tag: "Dembow / Drill",
    quote: "Entramos con una idea y salimos con un tema completo.",
    plays: "96K"
  },
  {
    name: "Invivienda Mode",
    tag: "Detroit / Trap",
    quote: "Ese bounce quedo internacional sin perder calle.",
    plays: "143K"
  }
];

const experience = [
  ["01", "Direccion creativa", "Aterrizamos el sonido, referencias, genero, BPM y energia antes de grabar."],
  ["02", "Vocal chain premium", "Tomas limpias, tuning fino, edicion precisa y textura moderna para streaming."],
  ["03", "Mix con pegada", "Bajo firme, voz al frente, brillo controlado y master listo para soltar."],
  ["04", "Entrega pro", "Archivos finales, revisiones claras y seguimiento desde el area de cliente."]
];

export default async function HomePage() {
  const [products, config] = await Promise.all([getProducts(ProductType.BEAT), getSiteConfig()]);
  const beats = products.slice(0, 5);

  return (
    <main className="overflow-hidden">
      <section className="hero-cinema relative min-h-[calc(100vh-84px)] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(229,9,20,.26),transparent_26rem),radial-gradient(circle_at_78%_24%,rgba(217,164,65,.12),transparent_20rem),linear-gradient(180deg,rgba(0,0,0,.2),#030303_96%)]" />
        <div className="red-particle-field absolute inset-0 opacity-80" />
        <div className="cinematic-grid absolute inset-0 opacity-50" />
        <div className="film-grain absolute inset-0 opacity-[0.16]" />

        <div className="relative mx-auto grid min-h-[calc(100vh-84px)] max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.04fr_0.96fr]">
          <MotionBlock className="max-w-5xl">
            <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.045] px-3 py-2 text-xs font-bold uppercase tracking-[0.22em] text-white/72 shadow-[0_12px_40px_rgba(0,0,0,.28)] backdrop-blur-2xl">
              <span className="relative h-8 w-8 overflow-hidden rounded-full bg-studio-red shadow-glow">
                <Image src="/images/ellbopa-logo.jpeg" alt="Ellbopa Music" fill sizes="32px" className="object-cover" priority />
              </span>
              {config.location}
            </div>
            <h1 className="hero-title font-display text-[clamp(3.15rem,8.2vw,8rem)] font-black uppercase leading-[0.86] tracking-[-0.025em]">
              Your next hit
              <span className="block text-glow-red">starts here.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/72 sm:text-xl">
              Marketplace musical, estudio premium y tienda digital para artistas que quieren sonar caro desde Santo Domingo hacia el mundo.
            </p>

            <div className="mt-8 max-w-3xl rounded-[1.35rem] border border-white/10 bg-white px-3 py-3 shadow-[0_24px_90px_rgba(0,0,0,.5)]">
              <label className="flex items-center gap-3">
                <Search className="ml-2 shrink-0 text-black/45" size={24} />
                <input
                  placeholder="What are you looking for?"
                  className="h-12 min-w-0 flex-1 bg-transparent text-base font-semibold text-black outline-none placeholder:text-black/45"
                />
                <span className="hidden rounded-xl bg-black/10 px-4 py-3 text-sm font-black text-black/70 sm:inline-flex">Text</span>
                <span className="rounded-xl bg-black px-4 py-3 text-sm font-black text-white shadow-[0_0_20px_rgba(229,9,20,.28)]">AI</span>
              </label>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href={whatsappUrl(`Quiero reservar en ${config.brandName}.`, config.whatsapp)}
                target="_blank"
                rel="noreferrer"
                className="premium-action group inline-flex min-h-12 items-center justify-center rounded-md bg-studio-red px-6 py-3 text-sm font-black uppercase tracking-wide text-white glow-button"
              >
                Reservar Studio
                <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
              </a>
              <CtaButton href="/beats" variant="secondary" className="min-h-12 uppercase tracking-wide">
                Explorar Instrumentales
              </CtaButton>
              <CtaButton href="/mezcla-online" variant="secondary" className="min-h-12 uppercase tracking-wide">
                Subir stems
              </CtaButton>
            </div>
            <div className="mt-10 grid max-w-3xl gap-3 sm:grid-cols-3">
              {[
                ["50%", "deposito para bloquear cita"],
                ["RD", "sonido urbano dominicano"],
                ["Online", "stems, mezcla y entrega digital"]
              ].map(([value, label]) => (
                <div key={label} className="rounded-lg border border-white/10 bg-white/[0.045] p-4 backdrop-blur-xl">
                  <p className="font-display text-3xl font-black text-studio-gold">{value}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/52">{label}</p>
                </div>
              ))}
            </div>
          </MotionBlock>

          <MotionBlock delay={0.12} className="relative">
            <div className="hero-video-shell group relative min-h-[560px] overflow-hidden rounded-lg border border-white/12 bg-black shadow-[0_40px_120px_rgba(229,9,20,.18)]">
              <video
                className="absolute inset-0 h-full w-full object-cover opacity-60 saturate-125"
                autoPlay
                muted
                loop
                playsInline
                poster="/images/ellbopa-logo.jpeg"
              >
                <source src="/videos/ellbopa-studio-loop.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_52%_38%,transparent,rgba(0,0,0,.82)_72%),linear-gradient(180deg,transparent,rgba(0,0,0,.92))]" />
              <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-red-500/25 bg-black/55 px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-red-100 backdrop-blur-xl">
                <span className="h-2 w-2 rounded-full bg-studio-red shadow-glow" />
                live booth
              </div>
              <div className="absolute right-5 top-5 rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white/70 backdrop-blur-xl">
                RGB Session
              </div>
              <div className="absolute inset-x-5 bottom-5 rounded-lg border border-white/10 bg-black/70 p-5 backdrop-blur-2xl">
                <div className="flex items-center justify-between gap-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-studio-gold">Studio loop</p>
                    <h2 className="mt-2 font-display text-3xl font-black">RGB, microfono, consola y presion real</h2>
                  </div>
                  <button className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-studio-red text-white shadow-glow transition hover:scale-105" aria-label="Preview">
                    <Play className="ml-1 h-6 w-6 fill-current" />
                  </button>
                </div>
                <Waveform active />
              </div>
            </div>
          </MotionBlock>
        </div>
        <div className="absolute bottom-5 left-1/2 z-10 hidden -translate-x-1/2 items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white/50 backdrop-blur-xl md:flex">
          Scroll
          <span className="h-px w-16 bg-gradient-to-r from-studio-red to-transparent" />
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#111]/92 py-10">
        <div className="mx-auto max-w-[1620px] px-4 sm:px-6">
          <div className="mb-7 flex items-center justify-between gap-4">
            <h2 className="font-display text-3xl font-black">Trending tracks</h2>
            <Link href="/beats" className="text-sm font-bold text-white/72 transition hover:text-studio-gold">See more</Link>
          </div>
          <div className="no-scrollbar flex gap-7 overflow-x-auto pb-3">
            {beats.slice(0, 6).map((beat, index) => (
              <article key={beat.id} className="group w-[220px] shrink-0">
                <Link href={`/checkout?productId=${encodeURIComponent(beat.id)}`} className="relative block aspect-square overflow-hidden rounded-lg border border-white/10 bg-black">
                  <Image src={beat.imageUrl || "/images/beat-cover.svg"} alt={beat.title} fill sizes="220px" className="object-cover transition duration-500 group-hover:scale-105" />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-75" />
                  <span className="absolute bottom-3 right-3 grid h-11 w-11 place-items-center rounded-full bg-white text-black opacity-0 shadow-[0_0_30px_rgba(255,255,255,.24)] transition group-hover:opacity-100">
                    <Play className="ml-0.5 h-5 w-5 fill-current" />
                  </span>
                </Link>
                <div className="mt-4">
                  <h3 className="line-clamp-1 font-display text-lg font-black">{beat.title}</h3>
                  <p className="mt-1 text-sm text-white/48">Ellbopa Music</p>
                  <p className="mt-1 text-xs text-white/40">{beat.genre || "Urban"} / {beat.bpm || 120} BPM</p>
                  <div className="mt-4 flex gap-2">
                    <Link href={`/checkout?productId=${encodeURIComponent(beat.id)}`} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-md border border-blue-500/70 bg-black text-sm font-black text-white transition hover:bg-blue-600">
                      <ShoppingBag size={16} /> {formatDop(beat.price)}
                    </Link>
                    <button className="grid h-12 w-12 place-items-center rounded-md border border-white/10 bg-white/[0.035] text-white/65 transition hover:text-studio-red" aria-label="Favorito">
                      <Heart size={17} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-10 sm:px-6 md:grid-cols-4">
        <AnimatedStat value="4+" label="Generos urbanos dominados" />
        <AnimatedStat value="50%" label="Reserva segura con deposito" />
        <AnimatedStat value="24/7" label="Ordenes online abiertas" />
        <AnimatedStat value="Pro" label="Entrega lista para streaming" />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="premium-strip overflow-hidden rounded-lg border border-white/10 bg-white/[0.035] py-5 backdrop-blur-xl">
          <div className="brand-marquee flex min-w-max gap-10 px-6">
            {[...config.artistLogos, "TRAP", "R&B", "DETROIT", "DEMBOW", "STEMS", "MASTER"].map((logo) => (
              <span key={logo} className="font-display text-2xl font-black uppercase tracking-[0.22em] text-white/34 transition hover:text-studio-gold">
                {logo}
              </span>
            ))}
          </div>
        </div>
      </section>

      <Section eyebrow="Servicios" title="El sonido completo, desde la idea hasta el lanzamiento">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {services.slice(0, 4).map((service, index) => {
            const Icon = [Mic2, SlidersHorizontal, Sparkles, UploadCloud][index];
            return (
              <MotionBlock key={service.title} delay={index * 0.06} className="premium-card premium-hover rounded-lg p-6">
                <Icon className="mb-6 h-8 w-8 text-studio-red" />
                <h3 className="font-display text-2xl font-black">{service.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/64">{service.description}</p>
                <p className="mt-6 font-bold text-studio-gold">Desde {formatDop(service.price)}</p>
              </MotionBlock>
            );
          })}
        </div>
      </Section>

      <Section eyebrow="Beat Store" title="Instrumentales con energia de plataforma">
        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <MotionBlock className="premium-card rounded-lg p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-studio-gold">Preview de beats</p>
                <h3 className="mt-2 font-display text-3xl font-black">Compra, agenda o manda tu voz encima.</h3>
              </div>
              <Link href="/beats" className="rounded-md border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-bold text-white/80 transition hover:border-studio-red hover:text-white">
                Ver tienda
              </Link>
            </div>
            <div className="mt-6 grid gap-3">
              {beats.slice(0, 3).map((beat, index) => (
                <article key={beat.id} className="group grid gap-4 rounded-lg border border-white/10 bg-black/42 p-4 transition hover:border-studio-red/55 hover:bg-white/[0.05] sm:grid-cols-[4.5rem_1fr_auto]">
                  <div className="relative h-20 overflow-hidden rounded-md bg-studio-red/20">
                    <Image src={beat.imageUrl || "/images/beat-cover.svg"} alt={beat.title} fill sizes="80px" className="object-cover transition duration-500 group-hover:scale-110" />
                    <span className="absolute inset-0 grid place-items-center bg-black/25">
                      <Play className="h-6 w-6 fill-current" />
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="truncate font-display text-xl font-black">{beat.title}</h4>
                    <p className="mt-1 text-sm text-white/55">{beat.genre || "Trap"} / {beat.bpm || 140} BPM / {beat.musicalKey || "Am"}</p>
                    <Waveform active={index === 0} />
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:block sm:text-right">
                    <p className="font-display text-xl font-black text-studio-gold">{formatDop(beat.price)}</p>
                    <Link href="/beats" className="mt-0 inline-flex rounded-md bg-studio-red px-4 py-2 text-sm font-bold text-white glow-button sm:mt-3">
                      Comprar
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </MotionBlock>
          <MotionBlock delay={0.1} className="premium-card rounded-lg p-6">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-studio-gold">Mezcla online</p>
            <h3 className="mt-2 font-display text-4xl font-black">Sube WAV, MP3 o ZIP desde cualquier pais.</h3>
            <p className="mt-4 text-sm leading-6 text-white/62">Ideal para artistas fuera de RD: manda stems, BPM, tono, referencia y notas. La orden queda lista para deposito o pago completo.</p>
            <div className="mt-6 grid gap-3">
              {["Stems separados", "BPM y tono", "Artista de referencia", "Notas del cliente"].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-md border border-white/10 bg-white/[0.035] p-3 text-sm text-white/72">
                  <ShieldCheck className="h-4 w-4 text-studio-gold" />
                  {item}
                </div>
              ))}
            </div>
            <CtaButton href="/mezcla-online" className="mt-6 w-full uppercase tracking-wide">
              Subir cancion para mezclar
            </CtaButton>
          </MotionBlock>
        </div>
      </Section>

      <Section eyebrow="Artistas que grabaron aqui" title="Prueba social con energia de calle y acabado premium">
        <div className="grid gap-5 lg:grid-cols-3">
          {artistProof.map((artist, index) => (
            <MotionBlock key={artist.name} delay={index * 0.08} className="artist-card premium-card premium-hover rounded-lg p-5">
              <div className="relative h-64 overflow-hidden rounded-md bg-black">
                <Image src="/images/ellbopa-logo.jpeg" alt={artist.name} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover opacity-70" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,transparent,rgba(0,0,0,.82)_72%)]" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-studio-gold">{artist.tag}</p>
                  <h3 className="mt-2 font-display text-3xl font-black">{artist.name}</h3>
                </div>
              </div>
              <blockquote className="mt-5 text-sm leading-6 text-white/70">"{artist.quote}"</blockquote>
              <div className="mt-5 flex items-center justify-between rounded-md border border-white/10 bg-white/[0.035] p-3">
                <div className="flex items-center gap-2 text-studio-gold">
                  {Array.from({ length: 5 }).map((_, star) => <Star key={star} className="h-4 w-4 fill-current" />)}
                </div>
                <p className="text-sm font-bold text-white/72">{artist.plays} streams</p>
              </div>
            </MotionBlock>
          ))}
        </div>
      </Section>

      <Section eyebrow="Antes y despues" title="Escucha como una voz cruda se convierte en disco">
        <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
          <MotionBlock className="premium-card rounded-lg p-6">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-studio-gold">Comparador interactivo</p>
            <h3 className="mt-3 font-display text-4xl font-black">Raw vocal vs. mezcla final</h3>
            <p className="mt-4 text-sm leading-6 text-white/62">Muestra el salto real: limpieza, afinacion, brillo, pegada, profundidad y master listo para plataformas.</p>
            <div className="mt-6 space-y-4">
              <label className="block text-xs font-bold uppercase tracking-[0.2em] text-white/50">Nivel de mezcla</label>
              <input className="accent-studio-red w-full" type="range" min="0" max="100" defaultValue="72" aria-label="Comparar antes y despues" />
              <div className="flex justify-between text-xs uppercase tracking-[0.16em] text-white/42">
                <span>Antes</span>
                <span>Despues</span>
              </div>
            </div>
          </MotionBlock>
          <MotionBlock delay={0.1} className="grid gap-4">
            <div className="premium-card rounded-lg p-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-bold text-white/72">Voz sin mezcla</p>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/45">raw</span>
              </div>
              <Waveform />
            </div>
            <div className="premium-card rounded-lg border-studio-red/40 p-5 shadow-glow">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-bold text-white">Mix/Master Ellbopa</p>
                <span className="rounded-full bg-studio-red px-3 py-1 text-xs font-bold text-white">final</span>
              </div>
              <Waveform active />
            </div>
          </MotionBlock>
        </div>
      </Section>

      <Section eyebrow="Experiencia Ellbopa" title="No vienes solo a grabar. Vienes a construir una version mas grande de tu sonido.">
        <div className="grid gap-5 lg:grid-cols-4">
          {experience.map(([number, title, text], index) => (
            <MotionBlock key={title} delay={index * 0.06} className="premium-card premium-hover rounded-lg p-6">
              <p className="font-display text-5xl font-black text-studio-red">{number}</p>
              <h3 className="mt-5 font-display text-2xl font-black">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/62">{text}</p>
            </MotionBlock>
          ))}
        </div>
      </Section>

      <Section eyebrow="Paquetes" title="Precios claros para moverte rapido">
        <div className="grid gap-5 md:grid-cols-3">
          {packages.map((pack) => (
            <article key={pack.name} className="premium-card premium-hover rounded-lg p-6">
              <h3 className="font-display text-2xl font-black">{pack.name}</h3>
              <p className="mt-3 font-display text-4xl font-black text-studio-gold">{pack.price}</p>
              <p className="mt-2 text-sm text-white/62">{pack.note}</p>
              <ul className="mt-6 space-y-3 text-sm text-white/75">
                {pack.items.map((item) => <li key={item}>- {item}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </Section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="relative overflow-hidden rounded-lg border border-studio-red/35 bg-[radial-gradient(circle_at_24%_24%,rgba(229,9,20,.28),transparent_24rem),linear-gradient(135deg,rgba(255,255,255,.08),rgba(255,255,255,.025))] p-8 shadow-[0_35px_120px_rgba(229,9,20,.16)] backdrop-blur-xl md:p-12">
          <div className="film-grain absolute inset-0 opacity-[0.12]" />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.26em] text-studio-gold">CTA premium</p>
              <h2 className="mt-3 max-w-4xl font-display text-4xl font-black uppercase leading-[0.95] sm:text-6xl">
                Si el tema tiene potencial, grabalo como si ya estuviera sonando.
              </h2>
              <p className="mt-5 max-w-2xl text-white/66">Reserva con deposito, compra un beat o sube tus stems. El flujo esta preparado para clientes locales y extranjeros.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <a href={whatsappUrl("Quiero una sesion premium en Ellbopa Music.", config.whatsapp)} target="_blank" rel="noreferrer" className="premium-action inline-flex min-h-12 items-center justify-center rounded-md bg-studio-red px-6 py-3 text-sm font-black uppercase tracking-wide text-white glow-button">
                <CalendarDays className="mr-2 h-4 w-4" />
                Reservar cita
              </a>
              <Link href="/beats" className="inline-flex min-h-12 items-center justify-center rounded-md border border-white/15 bg-white/[0.06] px-6 py-3 text-sm font-black uppercase tracking-wide text-white transition hover:border-studio-gold hover:text-studio-gold">
                <Headphones className="mr-2 h-4 w-4" />
                Explorar beats
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            [Radio, "Estudio fisico", "Invivienda / Los Mina, Santo Domingo RD."],
            [Waves, "Servicios online", "Subida de archivos, referencias y entrega digital."],
            [ShieldCheck, "Reserva seria", "No se confirma cita sin 50% de deposito."]
          ].map(([Icon, title, text]) => {
            const RealIcon = Icon as typeof Radio;
            return (
              <div key={title as string} className="premium-card rounded-lg p-5">
                <RealIcon className="mb-4 h-6 w-6 text-studio-gold" />
                <h3 className="font-display text-xl font-black">{title as string}</h3>
                <p className="mt-2 text-sm leading-6 text-white/60">{text as string}</p>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
