import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertProductOwner, normalizeProductUpdate, productUpdateSchema } from "@/lib/product-ownership";
import { canUploadProducts } from "@/lib/roles";
import { isAdminUser } from "@/lib/admin";

type ProductRouteProps = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: ProductRouteProps) {
  const session = await auth();
  if (!session?.user?.id || (!canUploadProducts(session.user.role) && !isAdminUser(session.user))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const ownership = await assertProductOwner(id, session.user);
  if (!ownership.ok) return NextResponse.json({ error: ownership.error }, { status: ownership.status });

  const body = await request.json().catch(() => ({}));
  const parsed = productUpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Datos invalidos", issues: parsed.error.flatten() }, { status: 400 });

  const product = await prisma.product.update({
    where: { id },
    data: normalizeProductUpdate(parsed.data),
    include: { _count: { select: { orders: true, favorites: true } } }
  });

  return NextResponse.json({ product: { ...product, fileUrl: undefined, hasFinalFile: Boolean(product.fileUrl) } });
}

export async function DELETE(_request: Request, { params }: ProductRouteProps) {
  const session = await auth();
  if (!session?.user?.id || (!canUploadProducts(session.user.role) && !isAdminUser(session.user))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const ownership = await assertProductOwner(id, session.user);
  if (!ownership.ok) return NextResponse.json({ error: ownership.error }, { status: ownership.status });

  const product = await prisma.product.update({
    where: { id },
    data: { active: false },
    include: { _count: { select: { orders: true, favorites: true } } }
  });

  return NextResponse.json({ product: { ...product, fileUrl: undefined, hasFinalFile: Boolean(product.fileUrl) } });
}
