import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLocalOrders } from "@/lib/local-workflow";
import { isOrderPaid, parseDownloadLinks } from "@/lib/download-links";

type DownloadOrder = {
  id: string;
  userId: string;
  product?: { fileUrl?: string | null } | null;
  status: string;
  totalAmount: number;
  paidAmount: number;
  finalFilesUrl?: string | null;
};

export async function GET(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  const [{ orderId }, session] = await Promise.all([params, auth()]);
  if (!session?.user?.id) return NextResponse.redirect(new URL(`/login?next=descargas&orderId=${encodeURIComponent(orderId)}`, request.url));

  const order = await loadOrder(orderId);
  if (!order || order.userId !== session.user.id || !isOrderPaid(order)) {
    return NextResponse.json({ error: "Download not available" }, { status: 403 });
  }

  const index = Number(new URL(request.url).searchParams.get("i") ?? 0);
  const link = parseDownloadLinks(order.finalFilesUrl || order.product?.fileUrl)[index];
  if (!link) return NextResponse.json({ error: "File not found" }, { status: 404 });

  if (/^https?:\/\//i.test(link.url)) {
    return NextResponse.redirect(link.url);
  }

  const publicRoot = path.join(process.cwd(), "public");
  const filePath = path.normalize(path.join(publicRoot, link.url.replace(/^\/+/, "")));
  if (!filePath.startsWith(publicRoot)) {
    return NextResponse.json({ error: "Invalid file" }, { status: 400 });
  }

  try {
    const bytes = await fs.readFile(filePath);
    const filename = path.basename(filePath);
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store"
      }
    });
  } catch {
    return NextResponse.json({ error: "File missing on server" }, { status: 404 });
  }
}

async function loadOrder(orderId: string): Promise<DownloadOrder | null> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { product: { select: { fileUrl: true } } }
    });
    return order;
  } catch (error) {
    console.error("[api-download][load]", error);
    const order = (await getLocalOrders()).find((item) => item.id === orderId);
    return order ? { ...order, product: null } : null;
  }
}
