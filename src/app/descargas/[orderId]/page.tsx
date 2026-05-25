import Link from "next/link";
import { redirect } from "next/navigation";
import { Download, LockKeyhole, ShieldCheck } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDop } from "@/lib/format";
import { getLocalOrders } from "@/lib/local-workflow";
import { isOrderPaid, parseDownloadLinks } from "@/lib/download-links";

export const metadata = { title: "Descarga Privada" };

type DownloadOrder = {
  id: string;
  userId: string;
  productId?: string | null;
  product?: { title: string; fileUrl?: string | null } | null;
  serviceType?: string | null;
  status: string;
  totalAmount: number;
  paidAmount: number;
  finalFilesUrl?: string | null;
};

export default async function DownloadPage({ params }: { params: Promise<{ orderId: string }> }) {
  const [{ orderId }, session] = await Promise.all([params, auth()]);
  if (!session?.user?.id) redirect(`/login?next=descargas&orderId=${encodeURIComponent(orderId)}`);

  const order = await loadOrder(orderId);
  if (!order || order.userId !== session.user.id) redirect("/cliente");
  if (!isOrderPaid(order)) redirect("/cliente?download=pending");

  const downloadSource = order.finalFilesUrl || (order.product?.fileUrl ? `${order.product.title}: ${order.product.fileUrl}` : "");
  const links = parseDownloadLinks(downloadSource);

  return (
    <main className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <section className="premium-card rounded-lg p-8">
        <div className="flex flex-col gap-5 border-b border-white/10 pb-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-studio-gold">Descarga privada</p>
            <h1 className="mt-3 font-display text-4xl font-black">{order.product?.title ?? order.serviceType ?? "Compra Ellbopa Music"}</h1>
            <p className="mt-3 max-w-2xl text-white/58">
              Esta pagina solo abre con la cuenta que hizo la compra. Tu pago esta confirmado y tu paquete ZIP incluye el archivo comprado y la licencia.
            </p>
          </div>
          <div className="rounded-md border border-studio-gold/25 bg-studio-gold/10 p-4 text-right">
            <p className="text-xs uppercase tracking-[0.18em] text-white/45">Total</p>
            <p className="font-display text-3xl font-black text-studio-gold">{formatDop(order.totalAmount)}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          {links.length === 0 ? (
            <div className="rounded-md border border-studio-red/25 bg-studio-red/10 p-5">
              <LockKeyhole className="text-studio-gold" size={30} />
              <h2 className="mt-4 font-display text-2xl font-bold">Archivo pendiente</h2>
              <p className="mt-2 text-white/58">El pago esta confirmado, pero el archivo final aun no fue asignado por admin.</p>
            </div>
          ) : (
            links.map((link, index) => (
              <a
                key={`${link.url}-${index}`}
                href={`/api/download/${order.id}?i=${index}`}
                className="group flex flex-col gap-4 rounded-lg border border-white/10 bg-black/45 p-5 transition hover:-translate-y-0.5 hover:border-studio-red/35 hover:shadow-glow sm:flex-row sm:items-center sm:justify-between"
              >
                <span>
                  <span className="block font-display text-2xl font-black">{link.title}</span>
                  <span className="mt-1 flex items-center gap-2 text-sm text-white/50"><ShieldCheck size={15} /> ZIP protegido con licencia incluida</span>
                </span>
                <span className="inline-flex items-center justify-center gap-2 rounded-md bg-studio-red px-5 py-3 font-bold glow-button">
                  <Download size={18} /> Descargar
                </span>
              </a>
            ))
          )}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/cliente" className="rounded-md border border-white/10 px-5 py-3 font-bold text-white/72 transition hover:border-studio-gold/35 hover:text-white">
            Volver a mi cuenta
          </Link>
          <Link href="/beats" className="rounded-md bg-studio-red px-5 py-3 font-bold glow-button">
            Comprar otro beat
          </Link>
        </div>
      </section>
    </main>
  );
}

async function loadOrder(orderId: string): Promise<DownloadOrder | null> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { product: true }
    });
    return order;
  } catch {
    return (await getLocalOrders()).find((order) => order.id === orderId) ?? null;
  }
}
