import Link from "next/link";
import { MessageSquare, Music2, Star, Users } from "lucide-react";

export const metadata = { title: "Comunidad" };

export default function ComunidadPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <p className="text-sm font-black uppercase tracking-[0.24em] text-studio-gold">Comunidad Ellbopa</p>
      <h1 className="mt-3 font-display text-5xl font-black uppercase">Productores, artistas y managers conectados.</h1>
      <p className="mt-4 max-w-2xl text-white/62">Un espacio preparado para reviews, colaboraciones, mensajes y perfiles de productores. La primera version conecta con compras, reservas y contacto directo.</p>
      <div className="mt-10 grid gap-4 md:grid-cols-4">
        {[
          [Users, "Perfiles", "Artistas y managers"],
          [Music2, "Catalogo", "Beats y sound kits"],
          [MessageSquare, "Mensajes", "Conversaciones privadas"],
          [Star, "Reviews", "Prueba social real"]
        ].map(([Icon, title, text]) => {
          const RealIcon = Icon as typeof Users;
          return (
            <div key={title as string} className="premium-card rounded-lg p-6">
              <RealIcon className="mb-5 h-7 w-7 text-studio-red" />
              <h2 className="font-display text-2xl font-black">{title as string}</h2>
              <p className="mt-2 text-sm text-white/55">{text as string}</p>
            </div>
          );
        })}
      </div>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/beats" className="rounded-md bg-studio-red px-5 py-3 text-sm font-black glow-button">Explorar marketplace</Link>
        <Link href="/contacto" className="rounded-md border border-white/10 px-5 py-3 text-sm font-bold text-white/70">Contactar estudio</Link>
      </div>
    </main>
  );
}
