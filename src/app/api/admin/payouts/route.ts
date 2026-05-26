import { NextResponse } from "next/server";
import { PayoutStatus, WalletTransactionType } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdminUser } from "@/lib/admin";

export async function POST(request: Request) {
  const session = await auth();
  if (!isAdminUser(session?.user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("action") ?? "") as PayoutStatus;
  const adminNote = String(formData.get("adminNote") ?? "");
  if (!id || !["APPROVED", "REJECTED", "PAID"].includes(status)) {
    return NextResponse.redirect(new URL("/admin?error=payout", request.url));
  }

  const payout = await prisma.payoutRequest.findUnique({ where: { id } });
  if (!payout) return NextResponse.redirect(new URL("/admin?error=payout", request.url));

  await prisma.$transaction(async (tx) => {
    await tx.payoutRequest.update({ where: { id }, data: { status, adminNote } });

    if (status === "REJECTED" && payout.status === "PENDING") {
      await tx.wallet.update({
        where: { id: payout.walletId },
        data: {
          availableBalance: { increment: payout.amount },
          pendingBalance: { decrement: payout.amount }
        }
      });
      await tx.walletTransaction.create({
        data: {
          walletId: payout.walletId,
          userId: payout.userId,
          payoutId: payout.id,
          type: WalletTransactionType.ADJUSTMENT,
          amount: payout.amount,
          description: "Payout rechazado: balance devuelto"
        }
      });
    }

    if (status === "PAID" && payout.status !== "PAID") {
      await tx.wallet.update({
        where: { id: payout.walletId },
        data: {
          pendingBalance: { decrement: payout.status === "PENDING" || payout.status === "APPROVED" ? payout.amount : 0 },
          totalPaidOut: { increment: payout.amount }
        }
      });
      await tx.walletTransaction.create({
        data: {
          walletId: payout.walletId,
          userId: payout.userId,
          payoutId: payout.id,
          type: WalletTransactionType.PAYOUT_PAID,
          amount: -payout.amount,
          description: "Payout marcado como pagado"
        }
      });
    }
  });

  return NextResponse.redirect(new URL("/admin#payouts", request.url));
}
