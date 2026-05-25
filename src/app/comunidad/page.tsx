import Link from "next/link";
import { MessageSquare, Music2, Send, Star, Users } from "lucide-react";
import { auth } from "@/lib/auth";
import { getCommunityPosts } from "@/lib/community";

export const metadata = {
  title: "Comunidad",
  description: "Feed musical de Ellbopa Music para artistas, productores e ingenieros."
};

export default async function ComunidadPage() {
  const [session, posts] = await Promise.all([auth(), getCommunityPosts()]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.24em] text-studio-gold">Comunidad Ellbopa</p>
          <h1 className="mt-3 font-display text-5xl font-black uppercase leading-[0.95]">Productores, artistas e ingenieros conectados.</h1>
          <p className="mt-4 max-w-2xl text-white/62">Feed para drops, colaboraciones, tips de mezcla, mensajes, reviews y actividad reciente del marketplace.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            [Users, "Perfiles", "Roles personalizados"],
            [Music2, "Catalogo", "Beats, presets y kits"],
            [MessageSquare, "Mensajes", "Colaboraciones y clientes"],
            [Star, "Reviews", "Prueba social real"]
          ].map(([Icon, title, text]) => {
            const RealIcon = Icon as typeof Users;
            return (
              <div key={title as string} className="premium-card rounded-lg p-5">
                <RealIcon className="mb-4 h-6 w-6 text-studio-red" />
                <h2 className="font-display text-xl font-black">{title as string}</h2>
                <p className="mt-1 text-sm text-white/55">{text as string}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {session?.user?.id ? (
            <form action="/api/community/posts" method="POST" className="premium-card rounded-2xl p-5">
              <label className="text-sm font-black uppercase tracking-[0.18em] text-white/45">Publicar en la comunidad</label>
              <textarea name="text" rows={4} maxLength={500} required placeholder="Comparte un drop, una busqueda de beat, un tip o una colaboracion..." className="control mt-3" />
              <button className="mt-4 inline-flex items-center gap-2 rounded-xl bg-studio-red px-5 py-3 text-sm font-black glow-button"><Send className="h-4 w-4" /> Publicar</button>
            </form>
          ) : (
            <div className="premium-card rounded-2xl p-5">
              <h2 className="font-display text-2xl font-black">Inicia sesion para participar</h2>
              <p className="mt-2 text-white/55">Puedes leer el feed, pero para publicar y seguir perfiles necesitas una cuenta.</p>
              <Link href="/login?next=/comunidad" className="mt-4 inline-flex rounded-xl bg-studio-red px-5 py-3 text-sm font-black glow-button">Entrar</Link>
            </div>
          )}

          {posts.map((post) => (
            <article key={post.id} className="premium-card rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Link href={`/u/${encodeURIComponent(post.userId === "ellbopa" ? "ellbopa" : post.userId)}`} className="font-display text-xl font-black hover:text-studio-gold">{post.authorName}</Link>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/38">{post.authorRole} / {formatCommunityDate(post.createdAt)}</p>
                </div>
                <span className="rounded-full border border-studio-gold/25 bg-studio-gold/10 px-3 py-1 text-sm font-black text-studio-gold">{post.likes} likes</span>
              </div>
              <p className="mt-4 whitespace-pre-wrap leading-7 text-white/72">{post.text}</p>
              <div className="mt-5 space-y-2 border-t border-white/10 pt-4">
                {post.comments.length === 0 ? <p className="text-sm text-white/38">Sin comentarios todavia.</p> : null}
                {post.comments.map((comment) => (
                  <div key={comment.id} className="rounded-xl bg-black/35 p-3 text-sm">
                    <strong>{comment.authorName}</strong>
                    <p className="mt-1 text-white/58">{comment.text}</p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>

        <aside className="h-fit rounded-2xl border border-white/10 bg-white/[0.045] p-5 backdrop-blur-xl">
          <h2 className="font-display text-2xl font-black">Actividad reciente</h2>
          <div className="mt-4 space-y-3 text-sm text-white/58">
            <p className="rounded-xl bg-black/35 p-3">Top tags: Trap, R&B, Dembow, Detroit, Vocal Chain</p>
            <p className="rounded-xl bg-black/35 p-3">Usa /u/ellbopa para ver el perfil publico principal.</p>
            <p className="rounded-xl bg-black/35 p-3">Los perfiles de productor e ingeniero se conectan al onboarding.</p>
          </div>
          <div className="mt-5 grid gap-3">
            <Link href="/marketplace" className="rounded-xl bg-studio-red px-5 py-3 text-center text-sm font-black glow-button">Explorar marketplace</Link>
            <Link href="/servicios" className="rounded-xl border border-white/10 px-5 py-3 text-center text-sm font-bold text-white/70">Contratar servicios</Link>
          </div>
        </aside>
      </section>
    </main>
  );
}

function formatCommunityDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("es-DO", { day: "2-digit", month: "short" });
}
