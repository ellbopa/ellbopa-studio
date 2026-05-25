import { NextResponse } from "next/server";
import { PayoutStatus, WalletTransactionType } from "@prisma/client";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isConfiguredAdminEmail } from "@/lib/config";
import { getOrCreateWallet } from "@/lib/wallet";

const createSchema = z.object({
  amount: z.coerce.number().int().min(100),
  method: z.string().trim().min(2).max(80),
  note: z.string().trim().max(500).optional()
});

const adminSchema = z.object({
  id: z.string().trim().min(1),
  action: z.enum(["APPROVED", "REJECTED", "PAID"]),
  adminNote: z.string().trim().max(500).optional()
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["PRODUCER", "ENGINEER", "ADMIN"].includes(session.user.role || "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await request.formData();
  const parsed = createSchema.safeParse({
    amount: String(formData.get("amount") ?? "0"),
    method: String(formData.get("method") ?? ""),
    note: String(formData.get("note") ?? "")
  });
  if (!parsed.success) return NextResponse.redirect(new URL("/dashboard/producer?error=payout", request.url));

  const wallet = await getOrCreateWallet(session.user.id);
  if (parsed.data.amount > wallet.availableBalance) {
    return NextResponse.redirect(new URL("/dashboard/producer?error=balance", request.url));
  }

  await prisma.$transaction(async (tx) => {
    const payout = await tx.payoutRequest.create({
      data: {
        walletId: wallet.id,
        userId: session.user.id,
        amount: parsed.data.amount,
        method: parsed.data.method,
        note: parsed.data.note
      }
    });
    await tx.wallet.update({
      where: { id: wallet.id },
      data: {
        availableBalance: { decrement: parsed.data.amount },
        pendingBalance: { increment: parsed.data.amount }
      }
    });
    await tx.walletTransaction.create({
      data: {
        walletId: wallet.id,
        userId: session.user.id,
        payoutId: payout.id,
        type: WalletTransactionType.PAYOUT_REQUEST,
        amount: -parsed.data.amount,
        description: `Solicitud payout por ${parsed.data.method}`
      }
    });
  });

  return NextResponse.redirect(new URL(session.user.role === "ENGINEER" ? "/dashboard/engineer?payout=1" : "/dashboard/producer?payout=1", request.url));
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN" && !isConfiguredAdminEmail(session?.user?.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = adminSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  await updatePayout(parsed.data.id, parsed.data.action, parsed.data.adminNote);
  return NextResponse.json({ ok: true });
}

export async function PUT(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN" && !isConfiguredAdminEmail(session?.user?.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const formData = await request.formData();
  const id = String(formData.get("id") ?? "");
  const action = String(formData.get("action") ?? "") as PayoutStatus;
  const adminNote = String(formData.get("adminNote") ?? "");
  if (!id || !["APPROVED", "REJECTED", "PAID"].includes(action)) return NextResponse.redirect(new URL("/admin?error=payout", request.url));
  await updatePayout(id, action, adminNote);
  return NextResponse.redirect(new URL("/admin#payouts", request.url));
}

async function updatePayout(id: string, status: PayoutStatus, adminNote?: string) {
  const payout = await prisma.payoutRequest.findUnique({ where: { id }, include: { wallet: true } });
  if (!payout) return;

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
}
