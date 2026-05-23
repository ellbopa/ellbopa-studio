import { Section } from "@/components/section";

export const metadata = { title: "Recuperar Password" };

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ sent?: string }> }) {
  const params = await searchParams;

  return (
    <main>
      <Section eyebrow="Recuperacion" title="Recupera tu acceso">
        <form action="/api/password/forgot" method="POST" className="premium-card mx-auto max-w-md space-y-4 rounded-lg p-6">
          {params.sent ? <p className="rounded-md border border-studio-gold/30 bg-studio-gold/10 p-3 text-sm text-studio-gold">Si el email existe, enviamos un enlace de recuperacion.</p> : null}
          <div>
            <label className="text-sm text-white/70">Email</label>
            <input name="email" type="email" required className="mt-2 w-full rounded-md border border-white/10 bg-black px-4 py-3" />
          </div>
          <button className="w-full rounded-md bg-studio-red px-5 py-3 font-bold glow-button">Enviar enlace</button>
        </form>
      </Section>
    </main>
  );
}
