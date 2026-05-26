import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  CircleAlert,
  CircleDollarSign,
  FileArchive,
  ListChecks,
  ShieldCheck,
  ShoppingBag,
  UserRound,
  Wallet
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { auth } from "@/lib/auth";
import { isAdminUser } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { formatDop } from "@/lib/format";

export const metadata = { title: "Testing Marketplace | Admin" };

const quickLinks = [
  { label: "Marketplace", href: "/marketplace" },
  { label: "Subir producto", href: "/dashboard/producer/upload" },
  { label: "Compras", href: "/compras" },
  { label: "Dashboard productor", href: "/dashboard/producer" },
  { label: "Admin payouts", href: "/admin/payouts" }
];

export default async function AdminTestingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (!isAdminUser(session.user)) redirect("/");

  const data = await loadTestingData();
  const checklist = buildChecklist(data);
  const completed = checklist.filter((item) => item.status === "ok").length;

  return (
    <main className="min-h-screen bg-[#030303] px-4 py-12 text-white sm:px-6">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_15%_10%,rgba(220,20,30,0.22),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(255,180,70,0.10),transparent_24%),linear-gradient(180deg,#070707,#030303_52%,#0a0202)]" />

      <section className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.28em] text-studio-gold">Admin QA</p>
            <h1 className="mt-4 font-display text-5xl font-black uppercase leading-[0.92] sm:text-7xl">Marketplace Testing</h1>
            <p className="mt-4 max-w-2xl text-white/58">
              Checklist interno para validar usuarios, productos, Stripe, comisiones, wallet, descargas protegidas y payouts.
            </p>
          </div>
          <div className="rounded-2xl border border-studio-gold/25 bg-studio-gold/10 p-5 text-right">
            <p className="text-xs uppercase tracking-[0.18em] text-white/45">Progreso</p>
            <p className="mt-1 font-display text-4xl font-black text-studio-gold">{completed}/{checklist.length}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-5">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href} className="group rounded-xl border border-white/10 bg-white/[0.045] p-4 font-bold text-white/72 transition hover:border-studio-red/45 hover:bg-studio-red/10 hover:text-white">
              <span className="flex items-center justify-between gap-3">
                {link.label}
                <ArrowRight className="h-4 w-4 text-white/35 transition group-hover:text-studio-gold" />
              </span>
            </Link>
          ))}
        </div>

        <section className="mt-8 grid gap-5 lg:grid-cols-[1fr_0.75fr]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-[0_30px_110px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-6">
            <div className="flex items-center gap-3">
              <ListChecks className="h-6 w-6 text-studio-gold" />
              <h2 className="font-display text-3xl font-black">Checklist visual</h2>
            </div>
            <div className="mt-6 space-y-3">
              {checklist.map((item, index) => (
                <ChecklistRow key={item.title} index={index + 1} {...item} />
              ))}
            </div>
          </div>

          <aside className="grid gap-5">
            <SummaryCard icon={UserRound} label="Usuarios artista" value={data.artistUsers} />
            <SummaryCard icon={UserRound} label="Usuarios productor" value={data.producerUsers} />
            <SummaryCard icon={FileArchive} label="Productos con archivo" value={data.productsWithFile} />
            <SummaryCard icon={ShoppingBag} label="Ordenes pagadas" value={data.paidOrders} />
            <SummaryCard icon={CircleDollarSign} label="Comision plataforma" value={formatDop(data.platformFees)} />
            <SummaryCard icon={Wallet} label="Wallet creadores" value={formatDop(data.walletBalances)} />
          </aside>
        </section>
      </section>
    </main>
  );
}

async function loadTestingData() {
  const [
    artistUsers,
    producerUsers,
    productsWithFile,
    paidOrders,
    ordersWithCommission,
    walletsWithBalance,
    protectedDownloads,
    payoutRequests,
    approvedOrPaidPayouts,
    totals
  ] = await Promise.all([
    prisma.user.count({ where: { role: "ARTIST" } }),
    prisma.user.count({ where: { role: "PRODUCER" } }),
    prisma.product.count({ where: { active: true, fileUrl: { not: null } } }),
    prisma.order.count({ where: { status: "PAID" } }),
    prisma.order.count({ where: { status: "PAID", platformFeeAmount: { gt: 0 }, creatorEarnings: { gt: 0 } } }),
    prisma.wallet.count({ where: { availableBalance: { gt: 0 } } }),
    prisma.order.count({ where: { status: "PAID", OR: [{ finalFilesUrl: { not: null } }, { product: { fileUrl: { not: null } } }] } }),
    prisma.payoutRequest.count(),
    prisma.payoutRequest.count({ where: { status: { in: ["APPROVED", "PAID"] } } }),
    prisma.order.aggregate({
      _sum: {
        platformFeeAmount: true,
        creatorEarnings: true,
        totalAmount: true
      },
      where: { status: "PAID" }
    })
  ]);

  return {
    artistUsers,
    producerUsers,
    productsWithFile,
    paidOrders,
    ordersWithCommission,
    walletsWithBalance,
    protectedDownloads,
    payoutRequests,
    approvedOrPaidPayouts,
    platformFees: totals._sum.platformFeeAmount ?? 0,
    creatorEarnings: totals._sum.creatorEarnings ?? 0,
    walletBalances: totals._sum.creatorEarnings ?? 0,
    totalSold: totals._sum.totalAmount ?? 0
  };
}

function buildChecklist(data: Awaited<ReturnType<typeof loadTestingData>>) {
  return [
    {
      title: "Crear usuario artista",
      detail: `${data.artistUsers} artista(s) registrados`,
      status: data.artistUsers > 0 ? "ok" : "pending",
      href: "/registro"
    },
    {
      title: "Crear usuario productor",
      detail: `${data.producerUsers} productor(es) registrados`,
      status: data.producerUsers > 0 ? "ok" : "pending",
      href: "/registro"
    },
    {
      title: "Subir producto con archivo final",
      detail: `${data.productsWithFile} producto(s) activos con fileUrl`,
      status: data.productsWithFile > 0 ? "ok" : "pending",
      href: "/dashboard/producer/upload"
    },
    {
      title: "Comprar producto",
      detail: `${data.totalSold ? formatDop(data.totalSold) : "Sin ventas todavia"}`,
      status: data.paidOrders > 0 ? "ok" : "pending",
      href: "/marketplace"
    },
    {
      title: "Confirmar Order PAID",
      detail: `${data.paidOrders} orden(es) pagadas`,
      status: data.paidOrders > 0 ? "ok" : "pending",
      href: "/admin#orders"
    },
    {
      title: "Confirmar comisión 20%",
      detail: `${data.ordersWithCommission} orden(es) con comision / ${formatDop(data.platformFees)}`,
      status: data.ordersWithCommission > 0 ? "ok" : data.paidOrders > 0 ? "review" : "pending",
      href: "/admin#payouts"
    },
    {
      title: "Confirmar wallet 80%",
      detail: `${data.walletsWithBalance} wallet(s) con balance / ${formatDop(data.creatorEarnings)}`,
      status: data.walletsWithBalance > 0 ? "ok" : data.ordersWithCommission > 0 ? "review" : "pending",
      href: "/dashboard/producer"
    },
    {
      title: "Confirmar descarga protegida",
      detail: `${data.protectedDownloads} orden(es) pagadas con archivo descargable`,
      status: data.protectedDownloads > 0 ? "ok" : data.paidOrders > 0 ? "review" : "pending",
      href: "/compras"
    },
    {
      title: "Crear payout request",
      detail: `${data.payoutRequests} solicitud(es) creadas`,
      status: data.payoutRequests > 0 ? "ok" : "pending",
      href: "/dashboard/producer"
    },
    {
      title: "Aprobar payout desde admin",
      detail: `${data.approvedOrPaidPayouts} payout(s) aprobado(s) o pagado(s)`,
      status: data.approvedOrPaidPayouts > 0 ? "ok" : data.payoutRequests > 0 ? "review" : "pending",
      href: "/admin/payouts"
    }
  ] satisfies Array<{ title: string; detail: string; status: "ok" | "pending" | "review"; href: string }>;
}

function ChecklistRow({
  index,
  title,
  detail,
  status,
  href
}: {
  index: number;
  title: string;
  detail: string;
  status: "ok" | "pending" | "review";
  href: string;
}) {
  const statusMap = {
    ok: { label: "OK", icon: BadgeCheck, className: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200" },
    pending: { label: "Pendiente", icon: CircleAlert, className: "border-white/10 bg-white/[0.045] text-white/55" },
    review: { label: "Revisar", icon: ShieldCheck, className: "border-studio-gold/30 bg-studio-gold/10 text-studio-gold" }
  };
  const current = statusMap[status];
  const Icon = current.icon;

  return (
    <div className="grid gap-3 rounded-2xl border border-white/10 bg-black/35 p-4 sm:grid-cols-[52px_1fr_auto] sm:items-center">
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/[0.06] font-display text-lg font-black text-studio-gold">
        {index}
      </div>
      <div className="min-w-0">
        <h3 className="font-display text-xl font-black">{title}</h3>
        <p className="mt-1 text-sm text-white/48">{detail}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-black ${current.className}`}>
          <Icon className="h-4 w-4" />
          {current.label}
        </span>
        <Link href={href} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-black text-white/70 transition hover:border-studio-red/40 hover:text-white">
          Abrir <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string | number }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <Icon className="h-5 w-5 text-studio-gold" />
      <p className="mt-4 text-xs uppercase tracking-[0.16em] text-white/45">{label}</p>
      <p className="mt-2 font-display text-3xl font-black text-white">{value}</p>
    </div>
  );
}
