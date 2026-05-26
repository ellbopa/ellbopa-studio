import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canUploadProducts } from "@/lib/roles";
import { isAdminUser } from "@/lib/admin";
import { MyProductsManager } from "@/components/my-products-manager";

export default async function ProducerProductsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?next=/dashboard/producer/products");
  if (!canUploadProducts(session.user.role) && !isAdminUser(session.user)) redirect("/");

  const products = await prisma.product.findMany({
    where: isAdminUser(session.user) ? {} : { ownerId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true, favorites: true } } }
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.24em] text-studio-gold">Creator OS</p>
          <h1 className="mt-2 font-display text-5xl font-black uppercase">Mis productos</h1>
          <p className="mt-3 max-w-2xl text-white/55">Edita, archiva y controla solo el contenido que pertenece a tu cuenta.</p>
        </div>
        <Link href="/dashboard/producer/upload" className="rounded-xl bg-studio-red px-5 py-3 text-center text-sm font-black text-white glow-button">Subir producto</Link>
      </div>
      <MyProductsManager initialProducts={products.map((product) => ({ ...product, fileUrl: undefined, hasFinalFile: Boolean(product.fileUrl), createdAt: product.createdAt.toISOString(), updatedAt: product.updatedAt.toISOString() }))} />
    </main>
  );
}
