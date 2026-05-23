import { Section } from "@/components/section";

export const metadata = { title: "Reset Password" };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string; email?: string }> }) {
  const params = await searchParams;

  return (
    <main>
      <Section eyebrow="Nuevo password" title="Crea un password nuevo">
        <form action="/api/password/reset" method="POST" className="premium-card mx-auto max-w-md space-y-4 rounded-lg p-6">
          <input type="hidden" name="token" value={params.token ?? ""} />
          <div>
            <label className="text-sm text-white/70">Email</label>
            <input name="email" type="email" defaultValue={params.email ?? ""} required className="mt-2 w-full rounded-md border border-white/10 bg-black px-4 py-3" />
          </div>
          <div>
            <label className="text-sm text-white/70">Nuevo password</label>
            <input name="password" type="password" minLength={6} required className="mt-2 w-full rounded-md border border-white/10 bg-black px-4 py-3" />
          </div>
          <button className="w-full rounded-md bg-studio-red px-5 py-3 font-bold glow-button">Cambiar password</button>
        </form>
      </Section>
    </main>
  );
}
