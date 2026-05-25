import Link from "next/link";
import { redirect } from "next/navigation";
import { Download, LockKeyhole, ShoppingBag, Sparkles } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDop } from "@/lib/format";
import { ClearCartOnSuccess } from "@/components/clear-cart-on-success";
import { isOrderPaid } from "@/lib/download-links";
import { getLocalOrders } from "@/lib/local-workflow";
import { hasStripeConfig } from "@/lib/config";
import { syncStripeCheckoutSession } from "@/lib/stripe-purchase-sync";

export const metadata = { title: "Mis Compras" };

type PurchaseOrder = {
  id: string;
  productId?: string | null;
  product?: { title: string; type?: string; imageUrl?: string | null; fileUrl?: string | null } | null;
  payments?: Array<{ status: string; amount: number; stripeSessionId?: string | null; createdAt?: Date | string }>;
  serviceType?: string | null;
  status: string;
  totalAmount: number;
  paidAmount: number;
  notes?: string | null;
  finalFilesUrl?: string | null;
  createdAt?: Date | string;
};

export default async function PurchasesPage({ searchParams }: { searchParams: Promise<{ success?: string; cancelled?: string; session_id?: string }> }) {
  const [params, session] = await Promise.all([searchParams, auth()]);
  if (!session?.user?.id) redirect("/login?next=compras");

  let syncResult: Awaited<ReturnType<typeof syncStripeCheckoutSession>> | null = null;
  if (params.session_id && hasStripeConfig()) {
    try {
      syncResult = await syncStripeCheckoutSession(params.session_id, session.user.id);
    } catch (error) {
      console.error("[compras][stripe-sync]", error);
      syncResult = { synced: false, reason: error instanceof Error ? error.message : "sync_exception" };
    }
  }

  const purchases = await loadPurchases(session.user.id);
  const paidPurchases = purchases.filter(isOrderPaid);
  const pendingPurchases = purchases.filter((order) => !isOrderPaid(order));

  return (
    <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      {params.success ? <ClearCartOnSuccess /> : null}
      {params.cancelled ? (
        <div className="mb-6 rounded-lg border border-studio-gold/25 bg-studio-gold/10 p-4 text-sm font-bold text-studio-gold">
          Pago cancelado. Tu tarjeta no fue cobrada y puedes intentarlo otra vez cuando quieras.
        </div>
      ) : null}
      {params.success ? (
        <div className="mb-6 rounded-lg border border-emerald-400/25 bg-emerald-400/10 p-4 text-sm font-bold text-emerald-200">
          Pago recibido. Si Stripe acaba de confirmar, tus descargas pueden tardar unos segundos en aparecer.
        </div>
      ) : null}
      {process.env.NODE_ENV === "development" ? (
        <section className="mb-6 rounded-lg border border-white/10 bg-black/50 p-4 text-xs text-white/60">
          <p className="font-black uppercase tracking-[0.18em] text-studio-gold">Debug compras</p>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            <DebugRow label="session_id" value={params.session_id ?? "no recibido"} />
            <DebugRow label="sync" value={syncResult ? JSON.stringify(syncResult) : "no ejecutado"} />
            <DebugRow label="userId" value={session.user.id} />
            <DebugRow label="orders usuario" value={String(purchases.length)} />
          </div>
          <div className="mt-3 space-y-1">
            {purchases.slice(0, 5).map((order) => (
              <p key={order.id} className="truncate text-white/45">
                {order.id} | {order.status} | paid {order.paidAmount}/{order.totalAmount} | product {order.productId ?? "null"} | payment {order.payments?.[0]?.status ?? "none"}
              </p>
            ))}
          </div>
        </section>
      ) : null}
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
                <div className="mt-2 flex justify-between text-sm text-white/58"><span>Licencia</span><span className="text-right">{extractLicense(order.notes)}</span></div>
                {order.createdAt ? <div className="mt-2 flex justify-between text-sm text-white/58"><span>Fecha</span><span>{formatDate(order.createdAt)}</span></div> : null}
              </div>
              <div className="mt-3 rounded-md border border-white/10 bg-black/25 p-3 text-xs text-white/45">
                <div className="flex justify-between gap-3"><span>Order</span><span className="truncate text-white/65">{order.id}</span></div>
                <div className="mt-1 flex justify-between gap-3"><span>Product</span><span className="truncate text-white/65">{order.productId ?? "sin producto directo"}</span></div>
                <div className="mt-1 flex justify-between gap-3"><span>Status</span><span className="text-white/65">{order.status}</span></div>
                <div className="mt-1 flex justify-between gap-3"><span>Payment</span><span className="text-white/65">{order.payments?.[0]?.status ?? "sin payment"}</span></div>
              </div>

              {isOrderPaid(order) && (order.finalFilesUrl || order.product?.fileUrl) ? (
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
    const dbOrders = await prisma.order.findMany({
      where: { userId },
      include: {
        product: true,
        payments: {
          orderBy: { createdAt: "desc" },
          select: { status: true, amount: true, stripeSessionId: true, createdAt: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    const localOrders = await getLocalOrders(userId);
    return mergeOrders(dbOrders, localOrders);
  } catch {
    return getLocalOrders(userId);
  }
}

function mergeOrders(dbOrders: PurchaseOrder[], localOrders: PurchaseOrder[]) {
  const byId = new Map<string, PurchaseOrder>();
  for (const order of localOrders) byId.set(order.id, order);
  for (const order of dbOrders) byId.set(order.id, order);
  return Array.from(byId.values()).sort((left, right) => {
    const leftDate = left.createdAt ? new Date(left.createdAt).getTime() : 0;
    const rightDate = right.createdAt ? new Date(right.createdAt).getTime() : 0;
    return rightDate - leftDate;
  });
}

function extractLicense(notes?: string | null) {
  if (!notes) return "Digital";
  const match = notes.match(/Licencia:\s*([^\n]+)/i);
  return match?.[1]?.trim() || "Digital";
}

function formatDate(date: Date | string) {
  const value = typeof date === "string" ? new Date(date) : date;
  return Number.isNaN(value.getTime()) ? String(date) : value.toLocaleDateString("es-DO");
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-md border border-white/10 bg-black/45 px-5 py-3 text-right">
      <p className="text-xs uppercase tracking-[0.16em] text-white/45">{label}</p>
      <p className="mt-1 font-display text-2xl font-black text-studio-gold">{value}</p>
    </div>
  );
}

function DebugRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2">
      <span className="text-white/35">{label}: </span>
      <span className="break-all text-white/70">{value}</span>
    </div>
  );
}
