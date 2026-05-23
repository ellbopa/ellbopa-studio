"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { getProviders, signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Chrome, Facebook } from "lucide-react";
import { useEffect } from "react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const [providers, setProviders] = useState<Record<string, unknown>>({});

  useEffect(() => {
    getProviders().then((items) => setProviders(items ?? {}));
  }, []);

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
          router.push(searchParams.get("next") === "checkout" ? "/beats" : "/cliente");
          router.refresh();
        });
      }}
    >
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
      {providers.google ? (
        <>
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-white/40">
            <span className="h-px flex-1 bg-white/10" /> OAuth <span className="h-px flex-1 bg-white/10" />
          </div>
          <button type="button" onClick={() => signIn("google", { callbackUrl: "/cliente" })} className="flex w-full items-center justify-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-5 py-3 font-bold transition hover:border-studio-gold/40">
            <Chrome size={18} /> Continuar con Google
          </button>
        </>
      ) : null}
      {providers.facebook ? (
        <button type="button" onClick={() => signIn("facebook", { callbackUrl: "/cliente" })} className="flex w-full items-center justify-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-5 py-3 font-bold transition hover:border-studio-gold/40">
          <Facebook size={18} /> Continuar con Facebook
        </button>
      ) : null}
    </form>
  );
}
