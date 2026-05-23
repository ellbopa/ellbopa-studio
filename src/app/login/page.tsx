import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { Section } from "@/components/section";

export const metadata = { title: "Login" };

export default function LoginPage() {
  return (
    <main>
      <Section eyebrow="Acceso" title="Entra a tu cuenta Ellbopa">
        <Suspense fallback={<div className="premium-card mx-auto max-w-md rounded-lg p-6 text-white/65">Cargando login...</div>}>
          <LoginForm />
        </Suspense>
        <p className="mt-6 text-center text-sm text-white/60">
          No tienes cuenta? <Link href="/registro" className="text-studio-gold">Registrate</Link>
        </p>
      </Section>
    </main>
  );
}
