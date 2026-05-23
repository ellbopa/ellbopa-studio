import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { formatDop } from "@/lib/format";
import { sendPaymentEmail } from "@/lib/email";
import { getLocalBookings, getLocalOrders, updateLocalBooking, updateLocalOrder, updateLocalPayment } from "@/lib/local-workflow";

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
    const orderId = checkout.metadata?.orderId || undefined;
    const bookingId = checkout.metadata?.bookingId || undefined;
    const digitalDownloads = checkout.metadata?.digitalDownloads || undefined;
    const userEmail = checkout.metadata?.userEmail || checkout.customer_details?.email || undefined;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;

    try {
      await prisma.payment.updateMany({
        where: { stripeSessionId: checkout.id },
        data: { status: "PAID", receiptUrl: checkout.url ?? undefined }
      });
    } catch (error) {
      console.error("[stripe-webhook][payment local]", error);
      await updateLocalPayment(checkout.id, { status: "PAID", receiptUrl: checkout.url ?? undefined });
    }

    if (orderId) {
      try {
        const order = await prisma.order.findUnique({ where: { id: orderId }, include: { user: true, product: true } });
        if (order) {
          const paidAmount = order.paidAmount + amount;
          const paidInFull = paidAmount >= order.totalAmount;
          await prisma.order.update({
            where: { id: orderId },
            data: {
              paidAmount,
              status: paidInFull ? "PAID" : "MIXING",
              finalFilesUrl: paidInFull && digitalDownloads ? digitalDownloads : order.finalFilesUrl
            }
          });
          await sendPaymentEmail(
            order.user.email,
            order.product?.title ?? order.serviceType ?? "Orden Ellbopa",
            formatDop(amount),
            paidInFull && digitalDownloads ? `${siteUrl}/descargas/${orderId}` : undefined
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
            finalFilesUrl: paidInFull && digitalDownloads ? digitalDownloads : localOrder.finalFilesUrl
          });
          if (userEmail) {
            await sendPaymentEmail(
              userEmail,
              localOrder.product?.title ?? localOrder.serviceType ?? "Orden Ellbopa",
              formatDop(amount),
              paidInFull && digitalDownloads ? `${siteUrl}/descargas/${orderId}` : undefined
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
          data: { status: "PAID" }
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
