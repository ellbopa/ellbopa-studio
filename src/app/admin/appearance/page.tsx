import { redirect } from "next/navigation";
import { ArrowLeft, Check, Palette } from "lucide-react";
import { auth } from "@/lib/auth";
import { isAdminUser } from "@/lib/admin";
import { getSiteConfig } from "@/lib/site-config";

export const metadata = { title: "Apariencia | Admin Ellbopa" };

const presets = [
  ["Rojo", "#ff1f1f"],
  ["Morado", "#9b5cff"],
  ["Azul", "#2f80ff"],
  ["Verde", "#22c55e"],
  ["Dorado", "#d9a441"],
  ["Blanco", "#f5f5f5"]
] as const;

export default async function AdminAppearancePage({ searchParams }: { searchParams?: Promise<{ saved?: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/cliente/login");
  if (!isAdminUser(session.user)) redirect("/");

  const [config, params] = await Promise.all([
    getSiteConfig(),
    (searchParams ?? Promise.resolve({})) as Promise<{ saved?: string }>
  ]);

  return (
    <main className="min-h-screen bg-[#030303] px-4 py-8 text-white sm:px-6 lg:px-10">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_0%,var(--brand-glow),transparent_30rem),linear-gradient(180deg,#050505,#090202)]" />
      <div className="mx-auto max-w-6xl">
        <a href="/admin" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-bold text-white/70 transition hover:border-[var(--brand-border)] hover:text-white">
          <ArrowLeft className="size-4" /> Volver al admin
        </a>

        <section className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <form action="/api/admin/appearance" method="POST" className="panel p-6">
            <div className="flex items-center gap-3">
              <div className="grid size-12 place-items-center rounded-2xl bg-studio-red shadow-glow">
                <Palette className="size-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-white/45">Apariencia / Tema</p>
                <h1 className="font-display text-3xl font-black">Color principal</h1>
              </div>
            </div>

            {params.saved ? (
              <div className="mt-5 flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-sm font-bold text-emerald-100">
                <Check className="size-4" /> Tema guardado y aplicado globalmente.
              </div>
            ) : null}

            <label className="field mt-6">
              Color personalizado
              <input name="primaryColor" type="color" defaultValue={config.primaryColor || "#ff1f1f"} className="mt-3 h-16 w-full cursor-pointer rounded-2xl border border-white/10 bg-black p-2" />
            </label>

            <div className="mt-6">
              <p className="text-sm font-bold text-white/70">Presets rapidos</p>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {presets.map(([label, color]) => (
                  <label key={color} className="cursor-pointer rounded-2xl border border-white/10 bg-black/35 p-3 transition hover:border-[var(--brand-border)]">
                    <input type="radio" name="presetColor" value={color} className="sr-only" />
                    <span className="flex items-center gap-3">
                      <span className="size-8 rounded-full border border-white/20" style={{ backgroundColor: color }} />
                      <span className="font-bold">{label}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <button className="mt-7 w-full rounded-xl bg-studio-red px-5 py-4 font-black text-white shadow-[0_0_34px_var(--brand-glow)] transition hover:scale-[1.01]">
              Guardar apariencia
            </button>
          </form>

          <section className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.035] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.38)] backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.24em] text-studio-red">Vista previa</p>
            <h2 className="mt-3 font-display text-5xl font-black uppercase leading-none">Tu proximo hit empieza aqui</h2>
            <p className="mt-4 max-w-2xl text-white/58">El color activo controla botones, bordes, highlights, links, badges, glow y estados hover.</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-[var(--brand-border)] bg-black/40 p-4">
                <p className="text-sm text-white/45">Boton</p>
                <button className="mt-4 rounded-xl bg-studio-red px-5 py-3 font-black text-white glow-button">Comprar</button>
              </div>
              <div className="rounded-2xl border border-[var(--brand-border)] bg-black/40 p-4 shadow-[0_0_34px_var(--brand-glow)]">
                <p className="text-sm text-white/45">Glow</p>
                <p className="mt-4 font-display text-3xl font-black text-studio-red">Premium</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <p className="text-sm text-white/45">Wave</p>
                <div className="mt-5 flex h-20 items-end gap-1">
                  {Array.from({ length: 18 }).map((_, index) => <span key={index} className="flex-1 rounded-full bg-studio-red" style={{ height: `${25 + ((index * 19) % 70)}%` }} />)}
                </div>
              </div>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
