import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { formatDop } from "@/lib/format";
import { sendPaymentEmail } from "@/lib/email";
import { getLocalBookings, getLocalOrders, updateLocalBooking, updateLocalOrder, updateLocalPayment } from "@/lib/local-workflow";
import { ensureStripeOrder, resolveStripeDigitalDownloads } from "@/lib/stripe-purchase-sync";
import { processOrderCommission } from "@/lib/wallet";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const checkout = event.data.object;
    const amount = Number(checkout.metadata?.amount ?? 0);
    let orderId = checkout.metadata?.orderId || undefined;
    const bookingId = checkout.metadata?.bookingId || undefined;
    const userEmail = checkout.metadata?.userEmail || checkout.customer_details?.email || undefined;
    const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
    const paymentIntentId = typeof checkout.payment_intent === "string" ? checkout.payment_intent : checkout.payment_intent?.id;

    if (process.env.NODE_ENV === "development") {
      console.error("[stripe-webhook][checkout-session-completed]", {
        sessionId: checkout.id,
        orderId,
        bookingId,
        userId: checkout.metadata?.userId,
        paymentStatus: checkout.payment_status
      });
    }

    try {
      await prisma.payment.updateMany({
        where: { stripeSessionId: checkout.id },
        data: { status: "PAID", receiptUrl: checkout.url ?? undefined, paymentIntentId }
      });
    } catch (error) {
      console.error("[stripe-webhook][payment local]", error);
      await updateLocalPayment(checkout.id, { status: "PAID", receiptUrl: checkout.url ?? undefined, paymentIntentId });
    }

    if ((!orderId || orderId.startsWith("order-")) && checkout.metadata?.userId && (checkout.metadata?.productId || checkout.metadata?.productIds)) {
      try {
        const order = await ensureStripeOrder(checkout, checkout.metadata.userId, amount);
        orderId = order?.id ?? orderId;
        if (order?.id) await prisma.payment.updateMany({ where: { stripeSessionId: checkout.id }, data: { orderId: order.id } });
      } catch (error) {
        console.error("[stripe-webhook][create-order]", error);
      }
    }

    if (orderId) {
      try {
        let order = await prisma.order.findUnique({ where: { id: orderId }, include: { user: true, product: true } });
        if (!order && checkout.metadata?.userId && (checkout.metadata?.productId || checkout.metadata?.productIds)) {
          const ensuredOrder = await ensureStripeOrder(checkout, checkout.metadata.userId, amount);
          orderId = ensuredOrder?.id ?? orderId;
          if (ensuredOrder) {
            await prisma.payment.updateMany({ where: { stripeSessionId: checkout.id }, data: { orderId: ensuredOrder.id } });
            order = await prisma.order.findUnique({ where: { id: ensuredOrder.id }, include: { user: true, product: true } });
          }
        }
        if (order) {
          const paidAmount = Math.max(order.paidAmount, Math.min(order.totalAmount, amount));
          const paidInFull = paidAmount >= order.totalAmount;
          const downloadLinks = paidInFull ? await resolveStripeDigitalDownloads(checkout, order) : undefined;
          await prisma.order.update({
            where: { id: orderId },
            data: {
              paidAmount,
              status: paidInFull ? "PAID" : "MIXING",
              finalFilesUrl: paidInFull && downloadLinks ? downloadLinks : order.finalFilesUrl
            }
          });
          if (paidInFull) await processOrderCommission(orderId);
          await sendPaymentEmail(
            order.user.email,
            order.product?.title ?? order.serviceType ?? "Orden Ellbopa",
            formatDop(amount),
            paidInFull && downloadLinks ? `${siteUrl}/descargas/${orderId}` : undefined
          );
        }
      } catch (error) {
        console.error("[stripe-webhook][order local]", error);
        const localOrder = (await getLocalOrders()).find((order) => order.id === orderId);
        if (localOrder) {
          const paidAmount = Number(localOrder.paidAmount || 0) + amount;
          const paidInFull = paidAmount >= localOrder.totalAmount;
          await updateLocalOrder(orderId, {
            paidAmount,
            status: paidInFull ? "PAID" : "MIXING",
            finalFilesUrl: localOrder.finalFilesUrl
          });
          if (userEmail) {
            await sendPaymentEmail(
              userEmail,
              localOrder.product?.title ?? localOrder.serviceType ?? "Orden Ellbopa",
              formatDop(amount),
              paidInFull && localOrder.finalFilesUrl ? `${siteUrl}/descargas/${orderId}` : undefined
            );
          }
        }
      }
    }

    if (bookingId) {
      try {
        const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { user: true } });
        if (booking) {
          const depositPaid = booking.depositPaid + amount;
          await prisma.booking.update({
            where: { id: bookingId },
            data: {
              depositPaid,
              status: depositPaid >= booking.depositRequired ? "PAID" : "PENDING"
            }
          });
          await sendPaymentEmail(booking.user.email, `Reserva: ${booking.serviceType}`, formatDop(amount));
        }
      } catch (error) {
        console.error("[stripe-webhook][booking local]", error);
        const localBooking = (await getLocalBookings()).find((booking) => booking.id === bookingId);
        if (localBooking) {
          const depositPaid = Number(localBooking.depositPaid || 0) + amount;
          await updateLocalBooking(bookingId, {
            depositPaid,
            status: depositPaid >= localBooking.depositRequired ? "PAID" : "PENDING"
          });
          if (userEmail) await sendPaymentEmail(userEmail, `Reserva: ${localBooking.serviceType}`, formatDop(amount));
        }
      }
    }
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object;
    try {
      const sessions = await stripe.checkout.sessions.list({ payment_intent: intent.id, limit: 1 });
      const session = sessions.data[0];
      if (session) {
        await prisma.payment.updateMany({
          where: { stripeSessionId: session.id },
          data: { status: "PAID", paymentIntentId: intent.id }
        });
      }
    } catch {
      // checkout.session.completed is the primary source of truth; this keeps payment intent events idempotent.
    }
  }

  if (event.type === "charge.refunded") {
    const charge = event.data.object;
    const paymentIntent = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
    if (paymentIntent) {
      try {
        const sessions = await stripe.checkout.sessions.list({ payment_intent: paymentIntent, limit: 1 });
        const session = sessions.data[0];
        if (session) {
          await prisma.payment.updateMany({
            where: { stripeSessionId: session.id },
            data: { status: "CANCELLED" }
          });
          const orderId = session.metadata?.orderId;
          const bookingId = session.metadata?.bookingId;
          if (orderId) await prisma.order.updateMany({ where: { id: orderId }, data: { status: "CANCELLED" } });
          if (bookingId) await prisma.booking.updateMany({ where: { id: bookingId }, data: { status: "CANCELLED" } });
        }
      } catch (error) {
        console.error("[stripe-webhook][refund]", error);
      }
    }
  }

  return NextResponse.json({ received: true });
}
