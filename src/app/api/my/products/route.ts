import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canUploadProducts } from "@/lib/roles";
import { isAdminUser } from "@/lib/admin";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || (!canUploadProducts(session.user.role) && !isAdminUser(session.user))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const products = await prisma.product.findMany({
    where: isAdminUser(session.user) ? {} : { ownerId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true, favorites: true } } }
  });

  return NextResponse.json({
    products: products.map((product) => ({
      ...product,
      fileUrl: undefined,
      hasFinalFile: Boolean(product.fileUrl)
    }))
  });
}
