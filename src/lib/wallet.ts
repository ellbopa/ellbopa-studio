import { Prisma, WalletTransactionType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const PLATFORM_FEE_PERCENT = 20;

export async function processOrderCommission(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      product: { include: { owner: true } },
      walletTransaction: true
    }
  });

  if (!order) return { processed: false, reason: "order_not_found" };
  if (order.walletTransaction || order.commissionProcessedAt) return { processed: false, reason: "already_processed" };
  if (order.status !== "PAID" && order.paidAmount < order.totalAmount) return { processed: false, reason: "not_paid" };

  const creatorId = order.creatorId || order.product?.ownerId;
  if (!creatorId) return { processed: false, reason: "missing_creator" };

  const grossAmount = Math.max(Number(order.totalAmount || 0), Number(order.paidAmount || 0));
  if (grossAmount <= 0) return { processed: false, reason: "zero_amount" };

  const platformFeeAmount = Math.round((grossAmount * PLATFORM_FEE_PERCENT) / 100);
  const creatorEarnings = grossAmount - platformFeeAmount;

  try {
    return await prisma.$transaction(async (tx) => {
      const existing = await tx.walletTransaction.findUnique({ where: { orderId } });
      if (existing) return { processed: false, reason: "already_processed" };

      const wallet = await tx.wallet.upsert({
        where: { userId: creatorId },
        update: {
          availableBalance: { increment: creatorEarnings },
          totalEarned: { increment: creatorEarnings }
        },
        create: {
          userId: creatorId,
          availableBalance: creatorEarnings,
          totalEarned: creatorEarnings
        }
      });

      await tx.order.update({
        where: { id: orderId },
        data: {
          creatorId,
          platformFeePercent: PLATFORM_FEE_PERCENT,
          platformFeeAmount,
          creatorEarnings,
          commissionProcessedAt: new Date()
        }
      });

      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          userId: creatorId,
          orderId,
          type: WalletTransactionType.SALE_EARNING,
          amount: creatorEarnings,
          platformFeeAmount,
          grossAmount,
          description: `Venta: ${order.product?.title ?? order.serviceType ?? order.id}`
        }
      });

      return { processed: true, creatorId, creatorEarnings, platformFeeAmount };
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { processed: false, reason: "already_processed" };
    }
    throw error;
  }
}

export async function getOrCreateWallet(userId: string) {
  return prisma.wallet.upsert({
    where: { userId },
    update: {},
    create: { userId }
  });
}
