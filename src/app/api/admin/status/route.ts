import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLocalBookings, getLocalOrders, updateLocalBooking, updateLocalOrder } from "@/lib/local-workflow";
import { isAdminUser } from "@/lib/admin";
import { formatDop } from "@/lib/format";
import { sendPaymentEmail } from "@/lib/email";
import { processOrderCommission } from "@/lib/wallet";

const statusSchema = z.object({
  entity: z.enum(["order", "booking"]),
  id: z.string().trim().min(1),
  status: z.enum(["PENDING", "PAID", "MIXING", "REVISION", "COMPLETED", "CANCELLED"]),
  finalFilesUrl: z.string().trim().max(2000).optional()
});

export async function POST(request: Request) {
  const session = await auth();
  if (!isAdminUser(session?.user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const parsed = statusSchema.safeParse({
    entity: String(formData.get("entity")),
    id: String(formData.get("id")),
    status: String(formData.get("status")),
    finalFilesUrl: String(formData.get("finalFilesUrl") ?? "")
  });
  if (!parsed.success) return NextResponse.redirect(new URL("/admin?error=status", request.url));

  const { entity, id, status } = parsed.data;
  const finalFilesUrl = parsed.data.finalFilesUrl ?? "";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;

  try {
    if (entity === "order") {
      const order = await prisma.order.findUnique({ where: { id }, include: { user: true, product: true } });
      const downloadFiles = finalFilesUrl || order?.finalFilesUrl || order?.product?.fileUrl || "";
      await prisma.order.update({
        where: { id },
        data: {
          status: status as never,
          ...(status === "PAID" && order ? { paidAmount: order.totalAmount } : {}),
          ...(downloadFiles ? { finalFilesUrl: downloadFiles } : {})
        }
      });
      if (status === "PAID") await processOrderCommission(id);
      if (status === "PAID" && order?.user?.email) {
        await sendPaymentEmail(
          order.user.email,
          order.product?.title ?? order.serviceType ?? "Orden Ellbopa",
          formatDop(order.totalAmount),
          downloadFiles ? `${siteUrl}/descargas/${id}` : undefined
        );
      }
    }

    if (entity === "booking") {
      const booking = await prisma.booking.findUnique({ where: { id }, select: { depositRequired: true } });
      await prisma.booking.update({
        where: { id },
        data: {
          status: status as never,
          ...(status === "PAID" && booking ? { depositPaid: booking.depositRequired } : {})
        }
      });
    }
  } catch (error) {
    console.error("[admin][status update]", error);
    if (entity === "order") {
      const order = (await getLocalOrders()).find((item) => item.id === id);
      const downloadFiles = finalFilesUrl || order?.finalFilesUrl || "";
      await updateLocalOrder(id, { status: status as never, ...(status === "PAID" && order ? { paidAmount: order.totalAmount } : {}), ...(downloadFiles ? { finalFilesUrl: downloadFiles } : {}) });
    }
    if (entity === "booking") {
      const booking = (await getLocalBookings()).find((item) => item.id === id);
      await updateLocalBooking(id, { status: status as never, ...(status === "PAID" && booking ? { depositPaid: booking.depositRequired } : {}) });
    }
  }

  return NextResponse.redirect(new URL("/admin", request.url));
}
