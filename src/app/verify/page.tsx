import { Section } from "@/components/section";

export const metadata = { title: "Verificar Email" };

export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ email?: string; error?: string; resent?: string }> }) {
  const params = await searchParams;
  const email = params.email ?? "";

  return (
    <main>
      <Section eyebrow="Verificacion" title="Confirma tu email con el codigo de 6 digitos">
        <div className="premium-card mx-auto max-w-md rounded-lg p-6">
          {params.error ? <p className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">Codigo invalido, expirado o limite alcanzado.</p> : null}
          {params.resent ? <p className="mb-4 rounded-md border border-studio-gold/30 bg-studio-gold/10 p-3 text-sm text-studio-gold">Codigo reenviado.</p> : null}
          <form action="/api/verify" method="POST" className="space-y-4">
            <div>
              <label className="text-sm text-white/70">Email</label>
              <input name="email" type="email" defaultValue={email} required className="mt-2 w-full rounded-md border border-white/10 bg-black px-4 py-3" />
            </div>
            <div>
              <label className="text-sm text-white/70">Codigo OTP</label>
              <input name="code" inputMode="numeric" maxLength={6} required className="mt-2 w-full rounded-md border border-white/10 bg-black px-4 py-3 text-center text-2xl tracking-[0.35em] text-studio-gold" />
            </div>
            <button className="w-full rounded-md bg-studio-red px-5 py-3 font-bold glow-button">Verificar</button>
          </form>
          <form action="/api/verify/resend" method="POST" className="mt-4">
            <input type="hidden" name="email" value={email} />
            <button className="w-full rounded-md border border-studio-gold/35 px-5 py-3 text-sm font-bold text-studio-gold">Reenviar codigo</button>
          </form>
        </div>
      </Section>
    </main>
  );
}
