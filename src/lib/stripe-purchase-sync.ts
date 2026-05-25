import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { processOrderCommission } from "@/lib/wallet";
import { ensurePrismaProduct } from "@/lib/catalog-product-sync";

type SyncResult = {
  synced: boolean;
  reason?: string;
  orderId?: string;
};

type EnsuredOrder = {
  id: string;
};

export async function syncStripeCheckoutSession(sessionId: string, userId: string): Promise<SyncResult> {
  if (!sessionId.startsWith("cs_")) return { synced: false, reason: "invalid_session_id" };

  const checkout = await stripe.checkout.sessions.retrieve(sessionId);
  const metadataUserId = checkout.metadata?.userId;

  if (metadataUserId !== userId) {
    if (process.env.NODE_ENV === "development") {
      console.error("[stripe-sync][user-mismatch]", { sessionId, metadataUserId, userId });
    }
    return { synced: false, reason: "user_mismatch" };
  }

  if (checkout.payment_status !== "paid") {
    if (process.env.NODE_ENV === "development") {
      console.error("[stripe-sync][not-paid]", { sessionId, paymentStatus: checkout.payment_status });
    }
    return { synced: false, reason: "not_paid" };
  }

  const amount = Number(checkout.metadata?.amount || Math.round(Number(checkout.amount_total || 0) / 100));
  const paymentIntentId = typeof checkout.payment_intent === "string" ? checkout.payment_intent : checkout.payment_intent?.id;
  let orderId = checkout.metadata?.orderId || undefined;
  const bookingId = checkout.metadata?.bookingId || undefined;

  if (!orderId && (checkout.metadata?.productId || checkout.metadata?.productIds)) {
    const order = await ensureStripeOrder(checkout, userId, amount);
    orderId = order?.id;
  }

  await prisma.payment.upsert({
    where: { stripeSessionId: checkout.id },
    update: {
      status: "PAID",
      orderId,
      bookingId,
      paymentIntentId,
      method: "STRIPE",
      amount,
      receiptUrl: checkout.url
    },
    create: {
      userId,
      orderId,
      bookingId,
      stripeSessionId: checkout.id,
      paymentIntentId,
      method: "STRIPE",
      amount,
      status: "PAID",
      receiptUrl: checkout.url
    }
  });

  if (orderId) {
    let order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      include: { product: true }
    });

    if (!order && (checkout.metadata?.productId || checkout.metadata?.productIds)) {
      const ensuredOrder = await ensureStripeOrder(checkout, userId, amount);
      orderId = ensuredOrder?.id ?? orderId;
      if (ensuredOrder) {
        await prisma.payment.updateMany({ where: { stripeSessionId: checkout.id }, data: { orderId: ensuredOrder.id } });
        order = await prisma.order.findFirst({
          where: { id: ensuredOrder.id, userId },
          include: { product: true }
        });
      }
    }

    if (!order) return { synced: false, reason: "order_not_found", orderId };

    const paidAmount = Math.max(Number(order.paidAmount || 0), Math.min(Number(order.totalAmount || amount), amount));
    const paidInFull = paidAmount >= Number(order.totalAmount || 0);
    const downloadLinks = paidInFull ? await resolveStripeDigitalDownloads(checkout, order) : undefined;

    await prisma.order.update({
      where: { id: order.id },
      data: {
        paidAmount,
        status: paidInFull ? "PAID" : "MIXING",
        finalFilesUrl: paidInFull && downloadLinks ? downloadLinks : order.finalFilesUrl
      }
    });
    if (paidInFull) await processOrderCommission(order.id);

    if (process.env.NODE_ENV === "development") {
      console.error("[stripe-sync][order-synced]", { sessionId, orderId: order.id, paidAmount, paidInFull });
    }
    return { synced: true, orderId: order.id };
  }

  if (bookingId) {
    const booking = await prisma.booking.findFirst({ where: { id: bookingId, userId } });
    if (booking) {
      const depositPaid = Math.max(Number(booking.depositPaid || 0), amount);
      await prisma.booking.update({
        where: { id: booking.id },
        data: { depositPaid, status: depositPaid >= booking.depositRequired ? "PAID" : "PENDING" }
      });
    }
  }

  return { synced: true, orderId };
}

export async function ensureStripeOrder(checkout: Stripe.Checkout.Session, userId: string, amount: number): Promise<EnsuredOrder | null> {
  const existingOrderId = checkout.metadata?.orderId || undefined;
  if (existingOrderId) {
    const existing = await prisma.order.findFirst({ where: { id: existingOrderId, userId }, select: { id: true } });
    if (existing) return existing;
  }

  const productIds = getCheckoutProductIds(checkout);
  if (productIds.length === 0) return null;

  let products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, title: true, type: true, ownerId: true }
  });

  if (products.length < productIds.length) {
    for (const productId of productIds) {
      if (!products.some((product) => product.id === productId)) {
        await ensurePrismaProduct(productId);
      }
    }
    products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, title: true, type: true, ownerId: true }
    });
  }
  if (products.length === 0) return null;

  const byId = new Map(products.map((product) => [product.id, product]));
  const orderedProducts = productIds.map((id) => byId.get(id)).filter((product): product is (typeof products)[number] => Boolean(product));
  const firstProduct = orderedProducts[0];
  const isSingleProduct = orderedProducts.length === 1;
  const licenseText = checkout.metadata?.licenseType || checkout.metadata?.licenseTypes || "digital";
  const serviceType = isSingleProduct ? `${firstProduct.type} / ${licenseText}` : `Compra Ellbopa (${orderedProducts.length} productos)`;

  const order = await prisma.order.create({
    data: {
      userId,
      productId: isSingleProduct ? firstProduct.id : undefined,
      creatorId: isSingleProduct ? firstProduct.ownerId : undefined,
      serviceType,
      totalAmount: amount,
      depositAmount: amount,
      notes: orderedProducts.map((product) => `${product.title} / ${product.type} / ${licenseText}`).join("\n")
    },
    select: { id: true }
  });

  if (process.env.NODE_ENV === "development") {
    console.error("[stripe-sync][order-created-from-session]", {
      sessionId: checkout.id,
      orderId: order.id,
      userId,
      productCount: orderedProducts.length
    });
  }

  return order;
}

function getCheckoutProductIds(checkout: Stripe.Checkout.Session) {
  return (checkout.metadata?.productIds || checkout.metadata?.productId || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

export async function resolveStripeDigitalDownloads(
  checkout: Stripe.Checkout.Session,
  order: { product?: { title: string; fileUrl?: string | null } | null }
) {
  const productIds = getCheckoutProductIds(checkout);

  if (productIds.length > 0) {
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, title: true, fileUrl: true }
    });
    const byId = new Map(products.map((product) => [product.id, product]));
    return productIds
      .map((id) => byId.get(id))
      .filter((product): product is { id: string; title: string; fileUrl: string } => Boolean(product?.fileUrl))
      .map((product) => `${product.title}: ${product.fileUrl}`)
      .join("\n") || undefined;
  }

  if (order.product?.fileUrl) return `${order.product.title}: ${order.product.fileUrl}`;
  return undefined;
}
