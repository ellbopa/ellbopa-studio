import { prisma } from "@/lib/prisma";
import { processOrderCommission } from "@/lib/wallet";

type PayPalOrderInput = {
  orderId?: string;
  bookingId?: string;
  userId: string;
  title: string;
  amount: number;
  returnUrl: string;
  cancelUrl: string;
};

type PayPalCaptureResult = {
  ok: boolean;
  orderId?: string | null;
  bookingId?: string | null;
  reason?: string;
};

export function hasPayPalConfig() {
  return Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
}

export function getPayPalMode() {
  return (process.env.PAYPAL_MODE || process.env.PAYPAL_ENV) === "live" ? "live" : "sandbox";
}

export function getPayPalStatusLabel() {
  if (!hasPayPalConfig()) return "OFF";
  return getPayPalMode() === "live" ? "LIVE" : "SANDBOX";
}

function getPayPalApiBase() {
  return getPayPalMode() === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
}

export async function createPayPalCheckout(input: PayPalOrderInput) {
  if (!hasPayPalConfig()) throw new Error("PayPal is not configured");

  const token = await getPayPalAccessToken();
  const response = await fetch(`${getPayPalApiBase()}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: input.orderId ?? input.bookingId ?? `ellbopa-${Date.now()}`,
          custom_id: JSON.stringify({
            orderId: input.orderId ?? "",
            bookingId: input.bookingId ?? "",
            userId: input.userId
          }),
          description: input.title.slice(0, 120),
          amount: {
            currency_code: "USD",
            value: toUsdString(input.amount)
          }
        }
      ],
      payment_source: {
        paypal: {
          experience_context: {
            brand_name: "Ellbopa Studio",
            shipping_preference: "NO_SHIPPING",
            user_action: "PAY_NOW",
            return_url: input.returnUrl,
            cancel_url: input.cancelUrl
          }
        }
      }
    })
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`PayPal order failed: ${response.status} ${details.slice(0, 200)}`);
  }

  const data = await response.json() as { id: string; links?: Array<{ rel: string; href: string }> };
  const approvalUrl = data.links?.find((link) => link.rel === "payer-action" || link.rel === "approve")?.href;
  if (!data.id || !approvalUrl) throw new Error("PayPal approval URL missing");
  return { paypalOrderId: data.id, approvalUrl };
}

export async function capturePayPalCheckout(paypalOrderId: string, userId: string): Promise<PayPalCaptureResult> {
  if (!hasPayPalConfig()) return { ok: false, reason: "paypal_not_configured" };

  const existingPayment = await prisma.payment.findUnique({
    where: { stripeSessionId: `paypal-${paypalOrderId}` },
    include: { order: { include: { product: true } }, booking: true }
  });

  if (!existingPayment || existingPayment.userId !== userId) return { ok: false, reason: "payment_not_found" };
  if (existingPayment.status === "PAID") return { ok: true, orderId: existingPayment.orderId, bookingId: existingPayment.bookingId };

  const token = await getPayPalAccessToken();
  const response = await fetch(`${getPayPalApiBase()}/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  const data = await response.json().catch(() => ({})) as { status?: string; purchase_units?: Array<{ payments?: { captures?: Array<{ id?: string; status?: string }> } }> };
  if (!response.ok && data.status !== "COMPLETED") {
    return { ok: false, reason: `paypal_capture_failed_${response.status}` };
  }

  const capture = data.purchase_units?.[0]?.payments?.captures?.[0];
  const captureId = capture?.id;
  const captured = data.status === "COMPLETED" || capture?.status === "COMPLETED";
  if (!captured) return { ok: false, reason: "paypal_not_completed" };

  await prisma.payment.update({
    where: { id: existingPayment.id },
    data: {
      status: "PAID",
      paymentIntentId: captureId,
      method: "PAYPAL"
    }
  });

  if (existingPayment.orderId) {
    const order = existingPayment.order;
    const paidAmount = Math.max(Number(order?.paidAmount || 0), Number(existingPayment.amount || 0));
    const paidInFull = order ? paidAmount >= Number(order.totalAmount || 0) : true;
    await prisma.order.update({
      where: { id: existingPayment.orderId },
      data: {
        paidAmount,
        status: paidInFull ? "PAID" : "MIXING",
        finalFilesUrl: paidInFull && order?.product?.fileUrl && !order.finalFilesUrl ? `${order.product.title}: ${order.product.fileUrl}` : order?.finalFilesUrl
      }
    });
    if (paidInFull) await processOrderCommission(existingPayment.orderId);
  }

  if (existingPayment.bookingId && existingPayment.booking) {
    const depositPaid = Math.max(Number(existingPayment.booking.depositPaid || 0), Number(existingPayment.amount || 0));
    await prisma.booking.update({
      where: { id: existingPayment.bookingId },
      data: {
        depositPaid,
        status: depositPaid >= existingPayment.booking.depositRequired ? "PAID" : "PENDING"
      }
    });
  }

  return { ok: true, orderId: existingPayment.orderId, bookingId: existingPayment.bookingId };
}

async function getPayPalAccessToken() {
  const credentials = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString("base64");
  const response = await fetch(`${getPayPalApiBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });
  if (!response.ok) throw new Error(`PayPal auth failed: ${response.status}`);
  const data = await response.json() as { access_token?: string };
  if (!data.access_token) throw new Error("PayPal access token missing");
  return data.access_token;
}

function toUsdString(dopAmount: number) {
  const rate = Number(process.env.PAYPAL_DOP_USD_RATE || 60);
  const usd = Math.max(1, Number(dopAmount || 0) / rate);
  return usd.toFixed(2);
}
