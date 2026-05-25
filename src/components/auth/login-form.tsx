"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { OAuthButtons } from "@/components/auth/oauth-buttons";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const registered = searchParams.get("registered");

  return (
    <form
      className="premium-card mx-auto max-w-md space-y-4 rounded-lg p-6"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        startTransition(async () => {
          const result = await signIn("credentials", {
            email: formData.get("email"),
            password: formData.get("password"),
            redirect: false
          });
          if (result?.error) {
            setError("Email/password incorrecto o cuenta sin verificar.");
            return;
          }
          router.push(searchParams.get("next") === "checkout" ? "/beats" : "/onboarding");
          router.refresh();
        });
      }}
    >
      {registered ? (
        <p className="rounded-md border border-emerald-400/25 bg-emerald-400/10 p-3 text-sm text-emerald-100">
          Cuenta creada. Inicia sesion para completar tu perfil.
        </p>
      ) : null}
      <div>
        <label className="text-sm text-white/70">Email</label>
        <input name="email" type="email" required className="mt-2 w-full rounded-md border border-white/10 bg-black px-4 py-3" />
      </div>
      <div>
        <label className="text-sm text-white/70">Password</label>
        <input name="password" type="password" required className="mt-2 w-full rounded-md border border-white/10 bg-black px-4 py-3" />
      </div>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      <button disabled={pending} className="w-full rounded-md bg-studio-red px-5 py-3 font-bold glow-button disabled:opacity-60">
        {pending ? "Entrando..." : "Entrar"}
      </button>
      <Link href="/forgot-password" className="block text-center text-sm text-studio-gold">
        Olvidaste tu password?
      </Link>
      <div className="flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-white/40">
        <span className="h-px flex-1 bg-white/10" /> OAuth <span className="h-px flex-1 bg-white/10" />
      </div>
      <OAuthButtons callbackUrl="/onboarding" />
    </form>
  );
}
