import { Section } from "@/components/section";
import { OAuthButtons } from "@/components/auth/oauth-buttons";

export const metadata = { title: "Registro" };

const errorMessages: Record<string, string> = {
  invalid: "Revisa los campos. El email debe ser valido y el password debe tener minimo 6 caracteres.",
  rate: "Demasiados intentos. Espera un minuto y vuelve a intentar.",
  unavailable: "No se pudo crear la cuenta. Si la base de datos no esta migrada, revisa PostgreSQL o intenta con otro email."
};

export default async function RegisterPage({ searchParams }: { searchParams?: Promise<{ error?: string }> }) {
  const params = (await searchParams) ?? {};
  const error = params.error ? errorMessages[params.error] ?? "No se pudo crear la cuenta." : "";

  return (
    <main>
      <Section eyebrow="Registro" title="Crea tu cuenta Ellbopa">
        <form action="/api/register" method="POST" className="premium-card mx-auto max-w-2xl space-y-4 rounded-lg p-6">
          {error ? <p className="rounded-md border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">{error}</p> : null}
          <OAuthButtons callbackUrl="/onboarding" />
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-white/40">
            <span className="h-px flex-1 bg-white/10" /> O crea con email <span className="h-px flex-1 bg-white/10" />
          </div>
          <div>
            <label className="text-sm text-white/70">Nombre</label>
            <input name="name" required className="mt-2 w-full rounded-md border border-white/10 bg-black px-4 py-3" />
          </div>
          <div>
            <label className="text-sm text-white/70">Email</label>
            <input name="email" type="email" required className="mt-2 w-full rounded-md border border-white/10 bg-black px-4 py-3" />
          </div>
          <div>
            <label className="text-sm text-white/70">WhatsApp</label>
            <input name="phone" className="mt-2 w-full rounded-md border border-white/10 bg-black px-4 py-3" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm text-white/70">
              Tipo de cuenta
              <select name="accountType" className="mt-2 w-full rounded-md border border-white/10 bg-black px-4 py-3">
                <option value="ARTIST">Artista</option>
                <option value="MANAGER">Manejador / Manager</option>
              </select>
            </label>
            <label className="text-sm text-white/70">
              Nombre artistico
              <input name="artistName" placeholder="Ej: Ellbopa" className="mt-2 w-full rounded-md border border-white/10 bg-black px-4 py-3" />
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-[180px_1fr]">
            <label className="text-sm text-white/70">
              Cantidad artistas
              <input name="artistCount" type="number" min={0} placeholder="0" className="mt-2 w-full rounded-md border border-white/10 bg-black px-4 py-3" />
            </label>
            <label className="text-sm text-white/70">
              Artistas que manejas
              <input name="managedArtists" placeholder="Ej: Artista 1, Artista 2, Artista 3" className="mt-2 w-full rounded-md border border-white/10 bg-black px-4 py-3" />
            </label>
          </div>
          <div>
            <label className="text-sm text-white/70">Password</label>
            <input name="password" type="password" minLength={6} required className="mt-2 w-full rounded-md border border-white/10 bg-black px-4 py-3" />
          </div>
          <button className="w-full rounded-md bg-studio-red px-5 py-3 font-bold glow-button">Crear cuenta y verificar email</button>
        </form>
      </Section>
    </main>
  );
}
