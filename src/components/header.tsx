import Link from "next/link";
import Image from "next/image";
import { Bell, ChevronDown, Grid3X3, Heart, LogOut, Music2, Search, Settings, Upload, UserRound, WandSparkles } from "lucide-react";
import { getSiteConfig } from "@/lib/site-config";
import { auth } from "@/lib/auth";
import { isConfiguredAdminEmail } from "@/lib/config";
import { CartLink } from "@/components/cart-link";

const nav = [
  ["Inicio", "/"],
  ["Marketplace", "/marketplace"],
  ["Tracks", "/tracks"],
  ["Instrumentales", "/beats"],
  ["Servicios", "/servicios"],
  ["Presets", "/presets"],
  ["Sound Kits", "/sound-kits"],
  ["Studio", "/reservas"],
  ["Comunidad", "/comunidad"],
  ["Favoritos", "/compras"],
  ["Mezcla", "/mezcla-online"],
  ["Reservas", "/reservas"],
  ["Cliente", "/cliente"],
  ["Compras", "/compras"],
  ["Admin", "/admin"]
];

export async function Header() {
  const [config, session] = await Promise.all([getSiteConfig(), auth()]);
  const isAdmin = session?.user?.role === "ADMIN" || isConfiguredAdminEmail(session?.user?.email);
  const visibleNav = isAdmin ? nav : nav.filter(([, href]) => href !== "/admin");

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#080808]/86 shadow-[0_20px_70px_rgba(0,0,0,.5)] backdrop-blur-2xl">
      <div className="border-b border-white/8 bg-black px-4 py-2 text-center text-xs font-bold text-white/78 sm:text-sm">
        Sube tus instrumentales, vende presets y reserva estudio desde Ellbopa Music
      </div>

      <div className="mx-auto flex max-w-[1620px] items-center gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="group flex shrink-0 items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-studio-red shadow-glow">
            <Image src="/images/ellbopa-logo.jpeg" alt="Ellbopa Music" width={40} height={40} className="h-10 w-10 rounded-md object-cover" priority />
          </span>
          <span className="hidden font-display text-xl font-black uppercase tracking-wide text-white transition group-hover:text-studio-gold sm:block">
            Ellbopa
          </span>
        </Link>

        <button className="hidden h-10 w-10 shrink-0 place-items-center rounded-md border border-white/10 bg-white/[0.04] text-white/70 transition hover:border-studio-red/40 hover:text-white lg:grid" aria-label="Apps">
          <Grid3X3 size={20} />
        </button>

        <nav className="hidden shrink-0 items-center gap-1 text-sm font-bold text-white/62 xl:flex">
          {visibleNav.slice(0, 6).map(([label, href]) => (
            <Link key={href} href={href} className="rounded-md px-3 py-2 transition hover:bg-white/[0.055] hover:text-white">
              {label}
            </Link>
          ))}
        </nav>

        <form action="/beats" className="group relative min-w-0 flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/38" size={20} />
          <input
            name="q"
            placeholder="Explore sounds, search instrumentals, presets, services..."
            className="h-12 w-full rounded-md border border-white/10 bg-white/[0.075] pl-12 pr-4 text-sm font-semibold text-white/82 outline-none transition placeholder:text-white/34 hover:border-studio-red/30 focus:border-studio-red/60 focus:shadow-[0_0_36px_rgba(229,9,20,.18)]"
          />
        </form>

        <div className="group/create relative hidden shrink-0 sm:block">
          <Link href={isAdmin ? "/admin#upload" : "/login?next=/admin"} className="inline-flex h-11 items-center gap-2 rounded-md bg-studio-red px-4 text-sm font-black text-white shadow-glow transition hover:-translate-y-0.5">
            Subir <Upload size={16} />
          </Link>
          {isAdmin ? (
            <div className="pointer-events-none absolute right-0 top-12 w-56 rounded-lg border border-white/10 bg-[#151515] p-2 opacity-0 shadow-[0_24px_70px_rgba(0,0,0,.55)] transition group-hover/create:pointer-events-auto group-hover/create:opacity-100">
              <Link href="/admin" className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-bold text-white/78 hover:bg-white/[0.06] hover:text-white"><Music2 size={17} /> Crear Track</Link>
              <Link href="/admin" className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-bold text-white/78 hover:bg-white/[0.06] hover:text-white"><WandSparkles size={17} /> Crear Sound Kit</Link>
              <Link href="/admin" className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-bold text-white/78 hover:bg-white/[0.06] hover:text-white"><Upload size={17} /> Upload Files</Link>
            </div>
          ) : null}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Link href="/compras" className="grid h-11 w-11 place-items-center rounded-md border border-white/10 bg-white/[0.04] text-white/70 transition hover:border-studio-red/40 hover:text-white" aria-label="Favoritos">
            <Heart size={19} />
          </Link>
          <button className="relative grid h-11 w-11 place-items-center rounded-md border border-white/10 bg-white/[0.04] text-white/70 transition hover:border-studio-red/40 hover:text-white" aria-label="Notificaciones">
            <Bell size={19} />
            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-studio-gold shadow-[0_0_12px_rgba(217,164,65,.8)]" />
          </button>
        </div>

        <CartLink />

        <div className="group/profile relative shrink-0">
          <button className="flex h-11 items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-2 pr-3 text-white/78 transition hover:border-studio-red/40 hover:text-white">
            <span className="relative h-8 w-8 overflow-hidden rounded-full bg-studio-red">
              <Image src={session?.user?.image || "/images/ellbopa-logo.jpeg"} alt={session?.user?.name || "Perfil"} fill sizes="32px" className="object-cover" />
            </span>
            <ChevronDown size={16} />
          </button>
          <div className="pointer-events-none absolute right-0 top-12 w-72 rounded-lg border border-white/10 bg-[#121212] p-3 opacity-0 shadow-[0_28px_80px_rgba(0,0,0,.65)] transition group-hover/profile:pointer-events-auto group-hover/profile:opacity-100">
            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
              <span className="relative h-11 w-11 overflow-hidden rounded-full bg-studio-red">
                <Image src={session?.user?.image || "/images/ellbopa-logo.jpeg"} alt={session?.user?.name || "Perfil"} fill sizes="44px" className="object-cover" />
              </span>
              <div className="min-w-0">
                <p className="truncate font-bold">{session?.user?.name || "Invitado"}</p>
                <p className="truncate text-xs text-white/45">{session?.user?.email || "Inicia sesion para comprar"}</p>
              </div>
            </div>
            <div className="mt-3 grid gap-1">
              <Link href="/compras" className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-bold text-white/76 hover:bg-white/[0.06] hover:text-white"><ShoppingIcon /> Purchased</Link>
              <Link href="/cliente" className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-bold text-white/76 hover:bg-white/[0.06] hover:text-white"><UserRound size={18} /> My Orders</Link>
              <Link href="/compras" className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-bold text-white/76 hover:bg-white/[0.06] hover:text-white"><Heart size={18} /> Favorites</Link>
              <Link href="/compras" className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-bold text-white/76 hover:bg-white/[0.06] hover:text-white"><Upload size={18} /> Downloads</Link>
              <Link href="/cliente" className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-bold text-white/76 hover:bg-white/[0.06] hover:text-white"><Music2 size={18} /> Messages</Link>
              <Link href="/cliente" className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-bold text-white/76 hover:bg-white/[0.06] hover:text-white"><Settings size={18} /> Account Settings</Link>
              {isAdmin ? <Link href="/admin" className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-bold text-studio-gold hover:bg-white/[0.06]">Studio Profile</Link> : null}
              {session?.user?.id ? (
                <Link href="/api/auth/signout" className="mt-2 flex items-center gap-3 border-t border-white/10 px-3 py-3 text-sm font-bold text-white/60 hover:text-white"><LogOut size={18} /> Log out</Link>
              ) : (
                <Link href="/login" className="mt-2 rounded-md bg-studio-red px-3 py-3 text-center text-sm font-black text-white glow-button">Sign in</Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <nav className="no-scrollbar mx-auto flex max-w-[1620px] gap-6 overflow-x-auto border-t border-white/8 px-4 py-3 text-sm font-bold text-white/58 sm:px-6">
        {visibleNav.slice(1, 8).map(([label, href]) => (
          <Link key={href} href={href} className="shrink-0 transition hover:text-white">
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

function ShoppingIcon() {
  return (
    <span className="grid h-[18px] w-[18px] place-items-center rounded border border-current text-[10px] font-black">
      $
    </span>
  );
}
