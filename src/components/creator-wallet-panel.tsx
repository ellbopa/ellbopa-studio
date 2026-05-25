import type { LucideIcon } from "lucide-react";
import { ArrowDownToLine, BadgeDollarSign, CircleDollarSign, Wallet } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDop } from "@/lib/format";
import { PLATFORM_FEE_PERCENT, getOrCreateWallet } from "@/lib/wallet";

export async function CreatorWalletPanel({ userId }: { userId: string }) {
  const wallet = await getOrCreateWallet(userId);
  const [transactions, payouts, orders] = await Promise.all([
    prisma.walletTransaction.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.payoutRequest.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 6 }),
    prisma.order.findMany({
      where: { creatorId: userId },
      include: { product: true },
      orderBy: { createdAt: "desc" },
      take: 8
    })
  ]);

  const grossSales = orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
  const platformFees = orders.reduce((sum, order) => sum + Number(order.platformFeeAmount || 0), 0);

  return (
    <section className="mt-10 grid gap-6 xl:grid-cols-[1fr_0.9fr]">
      <div className="premium-card rounded-lg p-6">
        <p className="text-sm font-black uppercase tracking-[0.26em] text-studio-gold">Wallet gratis</p>
        <h2 className="mt-3 font-display text-4xl font-black uppercase">Publicar es gratis. Solo cobramos cuando vendes.</h2>
        <p className="mt-3 text-white/58">Ellbopa Studio descuenta {PLATFORM_FEE_PERCENT}% de comision por venta y tu recibes el 80% como balance interno.</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <WalletStat icon={Wallet} label="Disponible" value={formatDop(wallet.availableBalance)} />
          <WalletStat icon={ArrowDownToLine} label="Pendiente payout" value={formatDop(wallet.pendingBalance)} />
          <WalletStat icon={CircleDollarSign} label="Ventas brutas" value={formatDop(grossSales)} />
          <WalletStat icon={BadgeDollarSign} label="Ganancias netas" value={formatDop(wallet.totalEarned)} />
          <WalletStat icon={CircleDollarSign} label="Comision descontada" value={formatDop(platformFees)} />
        </div>

        <form action="/api/payouts" method="POST" className="mt-6 grid gap-4 rounded-lg border border-white/10 bg-black/35 p-4 md:grid-cols-[1fr_1fr]">
          <label className="field">
            Monto a retirar
            <input name="amount" type="number" min={100} max={wallet.availableBalance} className="control" placeholder="Ej: 2500" required />
          </label>
          <label className="field">
            Metodo preferido
            <input name="method" className="control" placeholder="Banreservas, PayPal, efectivo..." required />
          </label>
          <label className="field md:col-span-2">
            Nota opcional
            <textarea name="note" rows={3} className="control" placeholder="Cuenta, nombre, telefono o detalle para coordinar." />
          </label>
          <button className="rounded-md bg-studio-red px-5 py-3 font-black text-white glow-button md:col-span-2" disabled={wallet.availableBalance <= 0}>
            Solicitar payout
          </button>
        </form>
      </div>

      <div className="grid gap-6">
        <div className="premium-card rounded-lg p-6">
          <h3 className="font-display text-2xl font-black">Ventas recientes</h3>
          <div className="mt-4 space-y-3">
            {orders.length === 0 ? <Empty text="Todavia no tienes ventas pagadas." /> : null}
            {orders.map((order) => (
              <Row key={order.id} title={order.product?.title ?? order.serviceType ?? "Venta"} meta={`${PLATFORM_FEE_PERCENT}% fee / neto ${formatDop(order.creatorEarnings)}`} value={formatDop(order.totalAmount)} />
            ))}
          </div>
        </div>

        <div className="premium-card rounded-lg p-6">
          <h3 className="font-display text-2xl font-black">Movimientos wallet</h3>
          <div className="mt-4 space-y-3">
            {transactions.length === 0 ? <Empty text="Sin movimientos todavia." /> : null}
            {transactions.map((item) => <Row key={item.id} title={item.type.replaceAll("_", " ")} meta={item.description ?? "Movimiento"} value={formatDop(item.amount)} />)}
          </div>
        </div>

        <div className="premium-card rounded-lg p-6">
          <h3 className="font-display text-2xl font-black">Solicitudes payout</h3>
          <div className="mt-4 space-y-3">
            {payouts.length === 0 ? <Empty text="Sin solicitudes." /> : null}
            {payouts.map((item) => <Row key={item.id} title={item.method} meta={item.status} value={formatDop(item.amount)} />)}
          </div>
        </div>
      </div>
    </section>
  );
}

function WalletStat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/40 p-4">
      <Icon className="h-5 w-5 text-studio-gold" />
      <p className="mt-3 text-xs uppercase tracking-[0.16em] text-white/45">{label}</p>
      <p className="mt-1 font-display text-2xl font-black text-studio-gold">{value}</p>
    </div>
  );
}

function Row({ title, meta, value }: { title: string; meta: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-white/10 bg-black/35 p-3">
      <div className="min-w-0">
        <p className="truncate font-bold">{title}</p>
        <p className="mt-1 truncate text-xs text-white/45">{meta}</p>
      </div>
      <strong className="shrink-0 text-studio-gold">{value}</strong>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="rounded-md border border-white/10 bg-black/35 p-4 text-sm text-white/55">{text}</p>;
}
