import { redirect } from "next/navigation";
import { ArrowLeft, BadgeCheck, ShieldAlert, UserCog, Users } from "lucide-react";
import { Role } from "@prisma/client";
import { auth } from "@/lib/auth";
import { isAdminUser, isOwnerAdminEmail } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Usuarios | Admin Ellbopa" };

const editableRoles = [Role.ARTIST, Role.PRODUCER, Role.ENGINEER, Role.STUDIO] as const;

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/cliente/login");
  if (!isAdminUser(session.user)) redirect("/");

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [users, totalUsers, usersToday, verifiedUsers] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            orders: true,
            products: true,
            payments: true,
            pageViews: true
          }
        }
      },
      take: 500
    }),
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.user.count({ where: { OR: [{ verified: true }, { emailVerified: { not: null } }] } })
  ]);

  return (
    <main className="min-h-screen bg-[#030303] px-4 py-8 text-white sm:px-6 lg:px-10">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_0%,rgba(220,20,30,0.22),transparent_30%),linear-gradient(180deg,#050505,#090202)]" />
      <div className="mx-auto max-w-7xl">
        <a href="/admin" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-bold text-white/70 transition hover:border-red-400/35 hover:text-white">
          <ArrowLeft className="size-4" /> Volver al admin
        </a>

        <section className="mt-6 overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.035] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.38)] backdrop-blur-xl">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-red-200/70">Neon production</p>
              <h1 className="mt-3 font-display text-4xl font-black uppercase sm:text-5xl">Usuarios registrados</h1>
              <p className="mt-3 max-w-2xl text-sm text-white/55">Clientes, productores, ingenieros y estudios registrados en Ellbopa Music.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Metric icon={Users} label="Total" value={totalUsers} />
              <Metric icon={UserCog} label="Hoy" value={usersToday} />
              <Metric icon={BadgeCheck} label="Verificados" value={verifiedUsers} />
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[28px] border border-white/10 bg-white/[0.035] p-4 backdrop-blur-xl sm:p-6">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-separate border-spacing-y-3 text-left">
              <thead className="text-xs uppercase tracking-[0.16em] text-white/38">
                <tr>
                  <th className="px-4">Usuario</th>
                  <th className="px-4">Rol</th>
                  <th className="px-4">Verificado</th>
                  <th className="px-4">Creado</th>
                  <th className="px-4">Actividad</th>
                  <th className="px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="rounded-2xl border border-white/10 bg-black/35 p-5 text-sm text-white/55">Todavia no hay usuarios registrados.</td>
                  </tr>
                ) : null}
                {users.map((user) => {
                  const ownerAdmin = isOwnerAdminEmail(user.email);
                  return (
                    <tr key={user.id} className="align-middle">
                      <td className="rounded-l-2xl border-y border-l border-white/10 bg-black/35 px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-full bg-red-600 font-black">
                            {user.image ? <img src={user.image} alt="" className="size-full object-cover" /> : user.name?.[0] || user.email[0]}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-black">{user.name || user.artistName || "Sin nombre"}</p>
                            <p className="truncate text-sm text-white/50">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="border-y border-white/10 bg-black/35 px-4 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-black ${ownerAdmin ? "bg-red-500/18 text-red-100" : "bg-white/10 text-white/70"}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="border-y border-white/10 bg-black/35 px-4 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-black ${user.verified || user.emailVerified ? "bg-emerald-400/12 text-emerald-200" : "bg-amber-400/12 text-amber-100"}`}>
                          {user.verified || user.emailVerified ? "Si" : "No"}
                        </span>
                      </td>
                      <td className="border-y border-white/10 bg-black/35 px-4 py-4 text-sm text-white/58">{formatDate(user.createdAt)}</td>
                      <td className="border-y border-white/10 bg-black/35 px-4 py-4 text-sm text-white/58">
                        {user._count.orders} ordenes / {user._count.products} productos / {user._count.pageViews} visitas
                      </td>
                      <td className="rounded-r-2xl border-y border-r border-white/10 bg-black/35 px-4 py-4">
                        <div className="flex flex-wrap justify-end gap-2">
                          <form action="/api/admin/users" method="POST" className="flex gap-2">
                            <input type="hidden" name="userId" value={user.id} />
                            <input type="hidden" name="action" value="role" />
                            <select name="role" defaultValue={ownerAdmin ? Role.ADMIN : user.role} disabled={ownerAdmin} className="rounded-xl border border-white/10 bg-[#0b0b0b] px-3 py-2 text-sm font-bold text-white outline-none">
                              {ownerAdmin ? <option value={Role.ADMIN}>ADMIN</option> : null}
                              {editableRoles.map((role) => <option key={role} value={role}>{role}</option>)}
                            </select>
                            <button disabled={ownerAdmin} className="rounded-xl bg-red-600 px-3 py-2 text-sm font-black transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-45">Guardar</button>
                          </form>
                          <button disabled className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-bold text-white/35" title="El modelo User aun no tiene campo blocked.">
                            <ShieldAlert className="size-4" /> Bloquear
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <div className="min-w-[130px] rounded-2xl border border-white/10 bg-black/35 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.16em] text-white/42">{label}</p>
        <Icon className="size-4 text-red-200/75" />
      </div>
      <p className="mt-2 font-display text-3xl font-black">{value}</p>
    </div>
  );
}

function formatDate(date: Date) {
  return date.toLocaleDateString("es-DO", { year: "numeric", month: "short", day: "2-digit" });
}
