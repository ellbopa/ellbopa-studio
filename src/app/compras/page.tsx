import Link from "next/link";
import { redirect } from "next/navigation";
import { Download, LockKeyhole, ShoppingBag, Sparkles } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDop } from "@/lib/format";
import { ClearCartOnSuccess } from "@/components/clear-cart-on-success";
import { isOrderPaid } from "@/lib/download-links";
import { getLocalOrders } from "@/lib/local-workflow";

export const metadata = { title: "Mis Compras" };

type PurchaseOrder = {
  id: string;
  productId?: string | null;
  product?: { title: string; type?: string; imageUrl?: string | null } | null;
  serviceType?: string | null;
  status: string;
  totalAmount: number;
  paidAmount: number;
  finalFilesUrl?: string | null;
  createdAt?: Date | string;
};

export default async function PurchasesPage({ searchParams }: { searchParams: Promise<{ success?: string }> }) {
  const [params, session] = await Promise.all([searchParams, auth()]);
  if (!session?.user?.id) redirect("/login?next=compras");

  const purchases = (await loadPurchases(session.user.id)).filter(isDigitalPurchase);
  const paidPurchases = purchases.filter(isOrderPaid);
  const pendingPurchases = purchases.filter((order) => !isOrderPaid(order));

  return (
    <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      {params.success ? <ClearCartOnSuccess /> : null}
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-studio-gold">Mis Compras</p>
          <h1 className="mt-3 font-display text-4xl font-black sm:text-6xl">Tus productos comprados</h1>
          <p className="mt-3 max-w-2xl text-white/58">
            Aqui solo aparecen beats, presets y productos digitales comprados con tu cuenta. Nada de reservas ni trabajos de mezcla.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:flex">
          <Stat label="Pagados" value={paidPurchases.length} />
          <Stat label="Pendientes" value={pendingPurchases.length} />
        </div>
      </div>

      {purchases.length === 0 ? (
        <section className="premium-card rounded-lg p-8 text-center">
          <ShoppingBag className="mx-auto text-studio-gold" size={54} />
          <h2 className="mt-5 font-display text-3xl font-black">Todavia no tienes compras</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/58">Cuando compres beats o presets, apareceran aqui con su boton de descarga privada.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/beats" className="rounded-md bg-studio-red px-5 py-3 font-bold glow-button">Comprar beats</Link>
            <Link href="/presets" className="rounded-md border border-studio-gold/30 px-5 py-3 font-bold text-studio-gold">Comprar presets</Link>
          </div>
        </section>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {purchases.map((order) => (
            <article key={order.id} className="premium-card rounded-lg p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-studio-gold">{order.product?.type ?? order.serviceType ?? "Digital"}</p>
                  <h2 className="mt-2 font-display text-2xl font-black">{order.product?.title ?? order.serviceType ?? "Compra Ellbopa Music"}</h2>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-black ${isOrderPaid(order) ? "bg-studio-gold text-black" : "bg-white/10 text-white/60"}`}>
                  {isOrderPaid(order) ? "PAGADO" : order.status}
                </span>
              </div>

              <div className="mt-5 rounded-md border border-white/10 bg-black/35 p-4">
                <div className="flex justify-between text-sm text-white/58"><span>Total</span><strong className="text-studio-gold">{formatDop(order.totalAmount)}</strong></div>
                <div className="mt-2 flex justify-between text-sm text-white/58"><span>Pagado</span><span>{formatDop(order.paidAmount)}</span></div>
              </div>

              {isOrderPaid(order) && order.finalFilesUrl ? (
                <Link href={`/descargas/${order.id}`} className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-studio-red px-4 py-3 text-sm font-black text-white shadow-glow transition hover:-translate-y-0.5">
                  <Download size={17} /> Descargar compra
                </Link>
              ) : isOrderPaid(order) ? (
                <div className="mt-5 flex w-full items-center justify-center gap-2 rounded-md border border-studio-gold/30 bg-studio-gold/10 px-4 py-3 text-sm font-bold text-studio-gold">
                  <LockKeyhole size={17} /> Archivo pendiente
                </div>
              ) : (
                <div className="mt-5 flex w-full items-center justify-center gap-2 rounded-md border border-white/10 bg-black/35 px-4 py-3 text-sm font-bold text-white/55">
                  <Sparkles size={17} /> Confirmando pago
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

async function loadPurchases(userId: string): Promise<PurchaseOrder[]> {
  try {
    return await prisma.order.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { createdAt: "desc" }
    });
  } catch {
    return getLocalOrders(userId);
  }
}

function isDigitalPurchase(order: PurchaseOrder) {
  const value = `${order.product?.type ?? ""} ${order.serviceType ?? ""}`.toUpperCase();
  return Boolean(order.productId || value.includes("BEAT") || value.includes("PRESET") || value.includes("COMPRA ELLBOPA"));
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-md border border-white/10 bg-black/45 px-5 py-3 text-right">
      <p className="text-xs uppercase tracking-[0.16em] text-white/45">{label}</p>
      <p className="mt-1 font-display text-2xl font-black text-studio-gold">{value}</p>
    </div>
  );
}
