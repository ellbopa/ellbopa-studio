import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Section } from "@/components/section";
import { whatsappUrl } from "@/lib/format";
import { getSiteConfig } from "@/lib/site-config";

export const metadata = { title: "Contacto" };

export default async function ContactPage() {
  const config = await getSiteConfig();

  return (
    <main>
      <Section eyebrow="Contacto" title="Hablemos de tu proximo tema">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="premium-card rounded-lg p-6">
            <h2 className="font-display text-2xl font-bold">{config.brandName}</h2>
            <div className="mt-6 space-y-4 text-white/70">
              <p className="flex items-center gap-3"><MapPin className="text-studio-gold" /> {config.location}</p>
              <p className="flex items-center gap-3"><Phone className="text-studio-gold" /> +{config.whatsapp}</p>
              <p className="flex items-center gap-3"><Mail className="text-studio-gold" /> contacto@ellbopastudio.com</p>
            </div>
            <a
              href={whatsappUrl(`Saludos, quiero informacion para trabajar en ${config.brandName}.`, config.whatsapp)}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex items-center gap-2 rounded-md bg-studio-red px-5 py-3 font-bold glow-button"
            >
              <MessageCircle size={18} /> Escribir por WhatsApp
            </a>
          </div>
          <form className="premium-card grid gap-4 rounded-lg p-6" action="/gracias" method="GET">
            <input type="hidden" name="tipo" value="contacto" />
            <label className="text-sm text-white/70">Nombre<input name="nombre" required className="mt-2 w-full rounded-md border border-white/10 bg-black px-4 py-3" /></label>
            <label className="text-sm text-white/70">WhatsApp<input name="whatsapp" required className="mt-2 w-full rounded-md border border-white/10 bg-black px-4 py-3" /></label>
            <label className="text-sm text-white/70">Servicio<select name="servicio" className="mt-2 w-full rounded-md border border-white/10 bg-black px-4 py-3"><option>Grabacion</option><option>Mezcla/Master</option><option>Beat personalizado</option><option>Presets</option></select></label>
            <label className="text-sm text-white/70">Mensaje<textarea name="mensaje" rows={5} className="mt-2 w-full rounded-md border border-white/10 bg-black px-4 py-3" /></label>
            <button className="rounded-md bg-studio-red px-5 py-3 font-bold glow-button">Enviar solicitud</button>
          </form>
        </div>
      </Section>
    </main>
  );
}
