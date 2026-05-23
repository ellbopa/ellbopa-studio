import Image from "next/image";
import Link from "next/link";
import { Instagram, ShieldCheck } from "lucide-react";
import { whatsappUrl } from "@/lib/format";
import { getSiteConfig } from "@/lib/site-config";

export async function Footer() {
  const config = await getSiteConfig();

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-black/70 backdrop-blur-xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(229,9,20,.14),transparent_24rem)]" />
      <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div>
          <div className="flex items-center gap-3 font-display text-xl font-black">
            <span className="relative h-10 w-10 overflow-hidden rounded-md bg-studio-red shadow-glow">
              <Image src="/images/ellbopa-logo.jpeg" alt="Ellbopa Music" fill sizes="40px" className="object-cover" />
            </span>
            {config.brandName}
          </div>
          <p className="mt-4 max-w-md text-sm leading-6 text-white/60">{config.footerText}</p>
          <p className="mt-4 text-sm text-studio-gold">
            {config.bankAccount} / {config.bankOwner}
          </p>
        </div>
        <div>
          <h3 className="font-bold">Plataforma</h3>
          <div className="mt-4 grid gap-2 text-sm text-white/60">
            <Link href="/beats">Beats Store</Link>
            <Link href="/presets">Presets Store</Link>
            <Link href="/mezcla-online">Mezcla Online</Link>
            <Link href="/reservas">Reservas</Link>
            <Link href="/pagos">Pagos</Link>
            <Link href="/contacto">Contacto</Link>
            <Link href="/privacidad">Privacidad</Link>
            <Link href="/terminos">Terminos</Link>
          </div>
        </div>
        <div>
          <h3 className="font-bold">Contacto</h3>
          <div className="mt-4 grid gap-3 text-sm text-white/60">
            <a href={whatsappUrl(`Quiero informacion de ${config.brandName}.`, config.whatsapp)}>
              WhatsApp +{config.whatsapp}
            </a>
            <span>{config.location}</span>
            <span className="inline-flex items-center gap-2 text-studio-gold">
              <ShieldCheck size={16} /> Reservas solo con deposito
            </span>
            <span className="inline-flex items-center gap-2">
              <Instagram size={16} /> {config.instagram}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
