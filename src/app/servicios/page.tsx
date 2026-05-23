import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Headphones, Instagram, MapPin, Mic2, Music2, ShieldCheck, Sparkles, Star } from "lucide-react";
import { CtaButton } from "@/components/cta-button";
import { Section } from "@/components/section";
import { services } from "@/lib/demo-data";
import { formatDop, whatsappUrl } from "@/lib/format";
import { getSiteConfig } from "@/lib/site-config";

export const metadata = { title: "Servicios" };

const producers = [
  {
    name: "Adonis Castillo",
    role: "Productor / Ingeniero principal",
    specialty: "Grabacion, mezcla, mastering y direccion vocal",
    location: "Invivienda / Los Mina, Santo Domingo Este",
    price: 2500,
    instagram: "@ellbopamusic",
    image: "/images/ellbopa-logo.jpeg",
    badge: "Studio Owner"
  },
  {
    name: "Ellbopa Music Team",
    role: "Produccion urbana",
    specialty: "Trap, R&B, Detroit, Dembow e instrumentales personalizados",
    location: "Santo Domingo, RD / Online",
    price: 3500,
    instagram: "@ellbopamusic",
    image: "/images/service-cover.svg",
    badge: "Producer Team"
  },
  {
    name: "Vocal Lab",
    role: "Edicion / Vocal tuning",
    specialty: "Afinacion moderna, comping, limpieza y vocal chains",
    location: "Online / Sesion remota",
    price: 1800,
    instagram: "@ellbopamusic",
    image: "/images/preset-cover.svg",
    badge: "Vocal Sound"
  }
];

export default async function ServicesPage() {
  const config = await getSiteConfig();
  const recording = services.find((service) => service.title.toLowerCase().includes("grabacion")) ?? services[0];
  const otherServices = services.filter((service) => service.title !== recording.title);

  return (
    <main>
      <section className="relative overflow-hidden border-b border-white/10 px-4 py-16 sm:px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(229,9,20,.28),transparent_24rem),radial-gradient(circle_at_80%_10%,rgba(217,164,65,.1),transparent_20rem)]" />
        <div className="studio-grid absolute inset-0 opacity-30" />
        <div className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.26em] text-studio-gold">Servicio principal</p>
            <h1 className="mt-4 font-display text-5xl font-black uppercase leading-[0.92] sm:text-7xl">
              Grabacion profesional primero.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/68">
              Sesion vocal guiada, toma limpia, direccion de performance y sonido listo para pasar a mezcla. En Ellbopa Music no vienes solo a grabar: vienes a sacar una version mas dura del tema.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <CtaButton href={`/reservas?service=${encodeURIComponent(recording.title)}`}>
                Reservar grabacion
              </CtaButton>
              <a
                href={whatsappUrl(`Quiero reservar grabacion en ${config.brandName}.`, config.whatsapp)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 items-center justify-center rounded-md border border-white/15 bg-white/[0.06] px-5 py-3 text-sm font-black text-white/78 transition hover:border-studio-gold hover:text-studio-gold"
              >
                Hablar por WhatsApp
              </a>
            </div>
          </div>

          <article className="premium-card relative overflow-hidden rounded-lg p-6">
            <div className="relative h-80 overflow-hidden rounded-lg bg-black">
              <Image src="/images/service-cover.svg" alt="Grabacion profesional" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-black/55 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-red-100 backdrop-blur-xl">
                  <Mic2 className="h-4 w-4" />
                  Booth session
                </div>
                <h2 className="font-display text-3xl font-black">{recording.title}</h2>
                <p className="mt-2 text-white/62">{recording.description}</p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <InfoPill icon={MapPin} label="Ubicacion" value="Invivienda / Los Mina" />
              <InfoPill icon={CalendarDays} label="Desde" value={formatDop(recording.price)} />
              <InfoPill icon={ShieldCheck} label="Reserva" value="50% deposito" />
            </div>
          </article>
        </div>
      </section>

      <Section eyebrow="Productores" title="Elige con quien quieres trabajar">
        <div className="grid gap-5 lg:grid-cols-3">
          {producers.map((producer) => (
            <article key={producer.name} className="premium-card premium-hover overflow-hidden rounded-lg">
              <div className="relative h-72 bg-black">
                <Image src={producer.image} alt={producer.name} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover opacity-82" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                <span className="absolute left-4 top-4 rounded-full border border-studio-gold/25 bg-black/60 px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-studio-gold backdrop-blur-xl">
                  {producer.badge}
                </span>
                <div className="absolute bottom-5 left-5 right-5">
                  <h2 className="font-display text-3xl font-black">{producer.name}</h2>
                  <p className="mt-1 text-sm font-bold text-white/62">{producer.role}</p>
                </div>
              </div>
              <div className="p-5">
                <p className="text-sm leading-6 text-white/65">{producer.specialty}</p>
                <div className="mt-5 space-y-3">
                  <ProfileLine icon={MapPin} text={producer.location} />
                  <ProfileLine icon={Instagram} text={producer.instagram} />
                  <ProfileLine icon={Headphones} text={`Desde ${formatDop(producer.price)}`} />
                </div>
                <div className="mt-6 grid gap-2 sm:grid-cols-2">
                  <Link href={`/reservas?service=${encodeURIComponent(`Sesion con ${producer.name}`)}`} className="rounded-md bg-studio-red px-4 py-3 text-center text-sm font-black text-white glow-button">
                    Agendar
                  </Link>
                  <a
                    href={`https://instagram.com/${producer.instagram.replace("@", "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md border border-white/10 px-4 py-3 text-center text-sm font-bold text-white/70 transition hover:border-studio-gold hover:text-studio-gold"
                  >
                    Instagram
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section eyebrow="Servicios" title="Todo lo que puedes ordenar en el estudio">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <ServiceCard service={recording} featured />
          {otherServices.map((service) => <ServiceCard key={service.title} service={service} />)}
        </div>
      </Section>
    </main>
  );
}

function ServiceCard({ service, featured = false }: { service: { title: string; description: string; price: number }; featured?: boolean }) {
  return (
    <article className={`premium-card premium-hover rounded-lg p-6 ${featured ? "border-studio-red/45 shadow-glow" : ""}`}>
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-studio-red/15 text-studio-red">
        {featured ? <Mic2 className="h-6 w-6" /> : <Music2 className="h-6 w-6" />}
      </div>
      <h2 className="font-display text-2xl font-black">{service.title}</h2>
      <p className="mt-4 min-h-20 leading-7 text-white/68">{service.description}</p>
      <p className="mt-5 text-xl font-black text-studio-gold">Desde {formatDop(service.price)}</p>
      <CtaButton href={`/reservas?service=${encodeURIComponent(service.title)}`} className="mt-6">
        Ordenar
      </CtaButton>
    </article>
  );
}

function InfoPill({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-black/35 p-4">
      <Icon className="mb-3 h-5 w-5 text-studio-gold" />
      <p className="text-xs uppercase tracking-[0.16em] text-white/42">{label}</p>
      <p className="mt-1 text-sm font-black">{value}</p>
    </div>
  );
}

function ProfileLine({ icon: Icon, text }: { icon: typeof MapPin; text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-white/10 bg-white/[0.035] p-3 text-sm text-white/68">
      <Icon className="h-4 w-4 shrink-0 text-studio-gold" />
      <span>{text}</span>
    </div>
  );
}
