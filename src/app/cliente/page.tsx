import Link from "next/link";
import { redirect } from "next/navigation";
import { Download, LockKeyhole } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDop } from "@/lib/format";
import { getLocalBookings, getLocalOrders } from "@/lib/local-workflow";
import { ClearCartOnSuccess } from "@/components/clear-cart-on-success";
import { isOrderPaid } from "@/lib/download-links";
import { dashboardForRole } from "@/lib/roles";

export const metadata = { title: "Area Cliente" };

type ClientOrder = {
  id: string;
  product?: { title: string } | null;
  serviceType?: string | null;
  status: string;
  totalAmount: number;
  paidAmount: number;
  depositAmount: number;
  finalFilesUrl?: string | null;
};

type ClientBooking = {
  id: string;
  serviceType: string;
  date: Date | string;
  time: string;
  status: string;
  depositRequired: number;
  depositPaid: number;
};

export default async function ClientAreaPage({ searchParams }: { searchParams: Promise<{ success?: string }> }) {
  const params = await searchParams;
  const session = await auth();
  if (!session?.user?.id) redirect("/cliente/login");
  if (session.user.role !== "ADMIN" && !session.user.onboardingCompleted) redirect("/onboarding");
  if (session.user.role !== "ADMIN" && session.user.role !== "ARTIST") redirect(dashboardForRole(session.user.role));

  let orders: ClientOrder[] = [];
  let bookings: ClientBooking[] = [];

  try {
    [orders, bookings] = await Promise.all([
      prisma.order.findMany({
        where: { userId: session.user.id },
        include: { product: true, messages: true },
        orderBy: { createdAt: "desc" }
      }),
      prisma.booking.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" }
      })
    ]);
  } catch (error) {
    console.error("[cliente][load]", error);
    [orders, bookings] = await Promise.all([getLocalOrders(session.user.id), getLocalBookings(session.user.id)]);
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      {params.success ? <ClearCartOnSuccess /> : null}
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.22em] text-studio-gold">Area de Cliente</p>
        <h1 className="mt-3 font-display text-4xl font-black">Hola, {session.user.name}</h1>
        <p className="mt-3 max-w-2xl text-white/58">Aqui ves tus ordenes, reservas, pagos pendientes y entregas finales.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Ordenes" value={orders.length} />
        <Stat label="Reservas" value={bookings.length} />
        <Stat label="Estado" value="Activo" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="premium-card rounded-lg p-6">
          <h2 className="font-display text-2xl font-bold">Tus ordenes</h2>
          <div className="mt-5 space-y-4">
            {orders.length === 0 ? <Empty text="Aun no tienes ordenes. Compra un beat o sube una cancion para mezclar." /> : null}
            {orders.map((order) => (
              <article key={order.id} className="rounded-md border border-white/10 bg-black/45 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-bold">{order.product?.title ?? order.serviceType ?? "Orden Ellbopa"}</h3>
                    <p className="mt-1 text-sm text-white/55">{order.status.replaceAll("_", " ")}</p>
                  </div>
                  <strong className="text-studio-gold">{formatDop(order.totalAmount)}</strong>
                </div>
                <p className="mt-3 text-sm text-white/60">
                  Pagado: {formatDop(order.paidAmount)} / Deposito: {formatDop(order.depositAmount)}
                </p>
                {order.finalFilesUrl && isOrderPaid(order) ? (
                  <Link href={`/descargas/${order.id}`} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-studio-red px-4 py-3 text-sm font-black text-white shadow-glow transition hover:-translate-y-0.5 hover:bg-red-600 sm:w-auto">
                    <Download size={17} /> Abrir descarga privada
                  </Link>
                ) : isOrderPaid(order) ? (
                  <div className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md border border-studio-gold/30 bg-studio-gold/10 px-4 py-3 text-sm font-bold text-studio-gold sm:w-auto">
                    <LockKeyhole size={17} /> Archivo pendiente
                  </div>
                ) : null}
                {order.paidAmount < order.depositAmount ? (
                  <form action="/api/checkout" method="POST" className="mt-4">
                    <input type="hidden" name="orderId" value={order.id} />
                    <input type="hidden" name="mode" value="deposit" />
                    <button className="rounded-md bg-studio-red px-4 py-2 text-sm font-bold glow-button">Pagar deposito</button>
                  </form>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <section className="premium-card rounded-lg p-6">
          <h2 className="font-display text-2xl font-bold">Tus reservas</h2>
          <div className="mt-5 space-y-4">
            {bookings.length === 0 ? <Empty text="Aun no tienes reservas. Separa una fecha con el 50%." /> : null}
            {bookings.map((booking) => (
              <article key={booking.id} className="rounded-md border border-white/10 bg-black/45 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-bold">{booking.serviceType}</h3>
                    <p className="mt-1 text-sm text-white/55">{formatBookingDate(booking.date)} / {booking.time}</p>
                  </div>
                  <span className="rounded bg-white/10 px-3 py-1 text-xs">{booking.status.replaceAll("_", " ")}</span>
                </div>
                <p className="mt-3 text-sm text-white/60">Deposito requerido: {formatDop(booking.depositRequired)}</p>
                {booking.depositPaid < booking.depositRequired ? (
                  <form action="/api/checkout" method="POST" className="mt-4">
                    <input type="hidden" name="bookingId" value={booking.id} />
                    <button className="rounded-md bg-studio-red px-4 py-2 text-sm font-bold glow-button">Pagar 50%</button>
                  </form>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="premium-card rounded-lg p-5">
      <p className="text-sm text-white/55">{label}</p>
      <p className="mt-2 font-display text-3xl font-black text-studio-gold">{value}</p>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="rounded-md border border-white/10 bg-black/35 p-4 text-sm text-white/60">{text}</p>;
}

function formatBookingDate(date: Date | string) {
  const value = typeof date === "string" ? new Date(`${date}T00:00:00`) : date;
  return Number.isNaN(value.getTime()) ? String(date) : value.toLocaleDateString("es-DO");
}
