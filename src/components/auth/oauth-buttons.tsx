"use client";

import { useEffect, useState } from "react";
import { getProviders, signIn } from "next-auth/react";
import { Chrome, Facebook } from "lucide-react";

type ProviderMap = Record<string, unknown>;

export function OAuthButtons({ callbackUrl = "/onboarding" }: { callbackUrl?: string }) {
  const [providers, setProviders] = useState<ProviderMap>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getProviders()
      .then((items) => setProviders(items ?? {}))
      .finally(() => setLoaded(true));
  }, []);

  if (!loaded) {
    return <div className="rounded-md border border-white/10 bg-white/[0.03] px-5 py-3 text-center text-sm text-white/45">Cargando opciones sociales...</div>;
  }

  return (
    <div className="space-y-3">
      {providers.google ? (
        <button type="button" onClick={() => signIn("google", { callbackUrl })} className="flex w-full items-center justify-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-5 py-3 font-bold transition hover:border-studio-gold/40">
          <Chrome size={18} /> Continuar con Google
        </button>
      ) : (
        <div className="rounded-md border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
          Google login no esta disponible. Revisa `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` y reinicia el servidor.
        </div>
      )}
      {providers.facebook ? (
        <button type="button" onClick={() => signIn("facebook", { callbackUrl })} className="flex w-full items-center justify-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-5 py-3 font-bold transition hover:border-studio-gold/40">
          <Facebook size={18} /> Continuar con Facebook
        </button>
      ) : null}
    </div>
  );
}
