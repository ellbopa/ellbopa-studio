import Image from "next/image";
import Link from "next/link";
import { Instagram, Mail, MessageCircle, Music2, ShieldCheck, Youtube } from "lucide-react";
import { whatsappUrl } from "@/lib/format";
import { getSiteConfig } from "@/lib/site-config";

const footerGroups = [
  {
    title: "Explorar",
    links: [
      ["Marketplace", "/marketplace"],
      ["Instrumentales", "/beats"],
      ["Presets", "/presets"],
      ["Sound Kits", "/sound-kits"],
      ["Servicios", "/servicios"]
    ]
  },
  {
    title: "Vender",
    links: [
      ["Subir producto", "/dashboard/producer/upload"],
      ["Mis productos", "/dashboard/producer/products"],
      ["Wallet", "/dashboard/producer"],
      ["Payouts", "/dashboard/producer"]
    ]
  },
  {
    title: "Soporte",
    links: [
      ["Contacto", "/contacto"],
      ["Reservas", "/reservas"],
      ["Compras", "/compras"],
      ["Cliente", "/cliente"]
    ]
  },
  {
    title: "Legal",
    links: [
      ["Terminos", "/terminos"],
      ["Privacidad", "/privacidad"],
      ["Pagos", "/pagos"]
    ]
  }
];

export async function Footer() {
  const config = await getSiteConfig();

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#030303]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,var(--brand-glow),transparent_26rem),radial-gradient(circle_at_80%_100%,rgba(217,164,65,.12),transparent_24rem)]" />
      <div className="absolute inset-x-0 top-0 h-px theme-gradient opacity-70" />
      <div className="relative mx-auto max-w-[1500px] px-4 py-12 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1.6fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-3 font-display text-2xl font-black uppercase tracking-wide">
              <span className="relative h-12 w-12 overflow-hidden rounded-xl bg-studio-red shadow-glow">
                <Image src="/images/ellbopa-logo.jpeg" alt="Ellbopa Music" fill sizes="48px" className="object-cover" />
              </span>
              {config.brandName}
            </Link>
            <p className="mt-5 max-w-xl text-sm leading-7 text-white/58">{config.footerText}</p>
            <div className="mt-6 grid gap-3 text-sm text-white/58">
              <a className="inline-flex items-center gap-2 transition hover:text-white" href={whatsappUrl(`Quiero informacion de ${config.brandName}.`, config.whatsapp)}>
                <MessageCircle className="h-4 w-4 text-studio-red" /> WhatsApp +{config.whatsapp}
              </a>
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-studio-gold" /> {config.bankAccount} / {config.bankOwner}
              </span>
              <span>{config.location}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {footerGroups.map((group) => (
              <div key={group.title}>
                <h3 className="font-display text-sm font-black uppercase tracking-[0.16em] text-white">{group.title}</h3>
                <div className="mt-4 grid gap-3 text-sm text-white/52">
                  {group.links.map(([label, href]) => (
                    <Link key={`${group.title}-${label}-${href}`} href={href} className="transition hover:text-studio-red">
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-6 rounded-3xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="font-display text-2xl font-black">Recibe drops, beats nuevos y tips para vender mejor.</p>
            <p className="mt-2 text-sm text-white/50">Newsletter de Ellbopa Studio para productores, artistas e ingenieros.</p>
          </div>
          <form className="flex min-w-0 flex-col gap-3 sm:flex-row">
            <label className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-black/45 px-4">
              <Mail className="h-4 w-4 text-white/35" />
              <input placeholder="Ingresa tu email" className="h-12 min-w-0 bg-transparent text-sm outline-none placeholder:text-white/32" />
            </label>
            <button className="rounded-2xl bg-studio-red px-6 py-3 text-sm font-black text-white glow-button">Suscribirme</button>
          </form>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-white/45 md:flex-row md:items-center md:justify-between">
          <p>© 2026 {config.brandName}. Todos los derechos reservados.</p>
          <div className="flex items-center gap-3">
            <a href={`https://instagram.com/${config.instagram.replace(/^@/, "")}`} target="_blank" rel="noreferrer" className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.04] transition hover:border-[var(--brand-border)] hover:text-white" aria-label="Instagram">
              <Instagram className="h-4 w-4" />
            </a>
            <Link href="/comunidad" className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.04] transition hover:border-[var(--brand-border)] hover:text-white" aria-label="Comunidad">
              <Music2 className="h-4 w-4" />
            </Link>
            <Link href="/contacto" className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.04] transition hover:border-[var(--brand-border)] hover:text-white" aria-label="Contacto">
              <Youtube className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
