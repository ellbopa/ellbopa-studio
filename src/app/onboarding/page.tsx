import { redirect } from "next/navigation";
import { BriefcaseBusiness, Building2, Headphones, Mic2, Search, Sparkles } from "lucide-react";
import { auth } from "@/lib/auth";
import { dashboardForRole } from "@/lib/roles";

export const metadata = { title: "Onboarding" };

const roles = [
  {
    role: "ARTIST",
    title: "Soy artista",
    icon: Mic2,
    text: "Comprar beats, reservar estudio, contratar servicios y descargar compras.",
    benefits: ["Mis compras", "Descargas", "Reservas", "Mensajes"]
  },
  {
    role: "PRODUCER",
    title: "Soy productor musical",
    icon: Headphones,
    text: "Subir beats, sound kits, licencias, precios, ventas y analytics.",
    benefits: ["Catalogo", "Upload", "Ventas", "Perfil publico"]
  },
  {
    role: "ENGINEER",
    title: "Soy ingeniero de mezcla/mastering",
    icon: Sparkles,
    text: "Crear servicios, recibir ordenes, subir entregas y manejar clientes.",
    benefits: ["Servicios", "Ordenes", "Archivos", "Calendario"]
  },
  {
    role: "STUDIO",
    title: "Tengo un estudio",
    icon: Building2,
    text: "Manejar horarios, reservas fisicas, depositos, equipo y ubicacion.",
    benefits: ["Reservas", "Horarios", "Depositos", "Equipo"]
  },
  {
    role: "ARTIST",
    title: "Solo quiero explorar",
    icon: Search,
    text: "Entrar como artista para comprar, guardar favoritos y explorar.",
    benefits: ["Marketplace", "Favoritos", "Compras", "Cuenta basica"]
  }
] as const;

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role === "ADMIN") redirect("/admin");
  if (session.user.onboardingCompleted) redirect(dashboardForRole(session.user.role));

  return (
    <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-black uppercase tracking-[0.26em] text-studio-gold">Configura tu cuenta</p>
        <h1 className="mt-4 font-display text-5xl font-black uppercase leading-[0.95]">Como usaras Ellbopa Music?</h1>
        <p className="mt-4 text-white/62">Elige tu perfil para mostrarte herramientas, dashboard y permisos correctos.</p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        {roles.map(({ role, title, icon: Icon, text, benefits }) => (
          <form key={title} action="/api/onboarding" method="POST" className="premium-card premium-hover flex rounded-lg p-5">
            <input type="hidden" name="role" value={role} />
            <div className="flex w-full flex-col">
              <div className="mb-5 grid h-12 w-12 place-items-center rounded-lg bg-studio-red/15 text-studio-red">
                <Icon className="h-6 w-6" />
              </div>
              <h2 className="font-display text-2xl font-black">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-white/60">{text}</p>
              <div className="mt-5 space-y-2">
                {benefits.map((benefit) => <p key={benefit} className="rounded-md border border-white/10 bg-white/[0.035] px-3 py-2 text-xs font-bold text-white/58">{benefit}</p>)}
              </div>
              <button className="mt-auto rounded-md bg-studio-red px-4 py-3 text-sm font-black text-white glow-button">Continuar</button>
            </div>
          </form>
        ))}
      </div>
      <div className="mt-8 flex items-center justify-center gap-2 text-sm text-white/45">
        <BriefcaseBusiness className="h-4 w-4" />
        Puedes completar tu perfil publico despues desde tu dashboard.
      </div>
    </main>
  );
}
