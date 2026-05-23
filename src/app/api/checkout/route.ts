import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { hasStripeConfig } from "@/lib/config";
import { getProducts } from "@/lib/products";
import { saveLocalOrder, saveLocalPayment, updateLocalOrder } from "@/lib/local-workflow";
import type { CartItem } from "@/lib/cart";
import { findLicenseOption } from "@/lib/licensing";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";

type CheckoutProduct = {
  id: string;
  title: string;
  type: string;
  price: number;
};

export async function POST(request: Request) {
  if (isRateLimited(`checkout:${getClientIp(request)}`, 20, 60_000)) {
    return NextResponse.json({ error: "Too many checkout attempts" }, { status: 429 });
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login?next=checkout", request.url));
  }
  if (!session.user.verified) {
    return NextResponse.redirect(new URL("/verify", request.url));
  }
  if (session.user.role !== "ADMIN" && !session.user.onboardingCompleted) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  const formData = await request.formData();
  const productId = String(formData.get("productId") ?? "");
  const cartJson = String(formData.get("cartJson") ?? "");
  const orderId = String(formData.get("orderId") ?? "");
  const bookingId = String(formData.get("bookingId") ?? "");
  const mode = String(formData.get("mode") ?? "deposit");
  const paymentMethod = String(formData.get("paymentMethod") ?? "stripe");
  const license = String(formData.get("license") ?? "basic");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;

  let title = "Ellbopa Music";
  let amount = 0;
  let targetOrderId: string | undefined;
  let targetBookingId: string | undefined;
  let digitalDownloads = "";

  try {
    if (cartJson) {
      const cartItems = parseCart(cartJson);
      if (cartItems.length === 0) return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
      const products = await getProducts();
      const selected = cartItems
        .map((cartItem) => {
          const baseId = cartItem.id.split(":")[0];
          const product = products.find((item) => item.id === baseId);
          if (!product) return null;
          const option = product.type === "BEAT" ? findLicenseOption(product, cartItem.license) : null;
          return {
            product,
            title: product.title,
            type: product.type,
            genre: product.genre,
            fileUrl: product.fileUrl,
            licenseTitle: option?.title ?? cartItem.licenseLabel ?? null,
            price: option?.price ?? product.price
          };
        })
        .filter(Boolean) as Array<{ product: CheckoutProduct & { fileUrl?: string | null; genre?: string | null }; title: string; type: string; genre?: string | null; fileUrl?: string | null; licenseTitle?: string | null; price: number }>;

      if (selected.length === 0) return NextResponse.json({ error: "Products not found" }, { status: 404 });

      amount = selected.reduce((sum, product) => sum + product.price, 0);
      title = selected.length === 1 ? selected[0].title : `Compra Ellbopa (${selected.length} productos)`;
      digitalDownloads = selected
        .map((item) => [item.licenseTitle ? `${item.title} (${item.licenseTitle})` : item.title, item.fileUrl].filter(Boolean).join(": "))
        .filter(Boolean)
        .join("\n");

      try {
        const order = await prisma.order.create({
          data: {
            userId: session.user.id,
            serviceType: title,
            totalAmount: amount,
            depositAmount: amount,
            notes: selected.map((item) => `${item.title} / ${item.type} / ${item.licenseTitle ?? "Digital"} / ${item.genre ?? "Digital"}`).join("\n")
          }
        });
        targetOrderId = order.id;
      } catch (error) {
        console.error("[checkout][cart local order]", error);
        const order = await saveLocalOrder({
          userId: session.user.id,
          serviceType: title,
          totalAmount: amount,
          depositAmount: amount,
          notes: selected.map((item) => `${item.title} / ${item.type} / ${item.licenseTitle ?? "Digital"} / ${item.genre ?? "Digital"}`).join("\n")
        });
        targetOrderId = order.id;
      }
    }

    if (productId) {
      let product: (CheckoutProduct & { fileUrl?: string | null; genre?: string | null; premiumPrice?: number | null; exclusivePrice?: number | null }) | null = null;
      try {
        product = await prisma.product.findUnique({ where: { id: productId } });
      } catch (error) {
        console.error("[checkout][product db]", error);
      }
      const fallbackProduct = (await getProducts()).find((item) => item.id === productId);
      if (!product && fallbackProduct) product = fallbackProduct;
      if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
      const selectedLicense = product.type === "BEAT" ? findLicenseOption(product, license) : null;
      const productPrice = selectedLicense?.price ?? product.price;
      const depositAmount = Math.ceil(productPrice * 0.5);
      try {
        const order = await prisma.order.create({
          data: {
            userId: session.user.id,
            productId: product.id,
            serviceType: selectedLicense ? `${product.type} / ${selectedLicense.title}` : product.type,
            totalAmount: productPrice,
            depositAmount,
            notes: selectedLicense ? `Licencia: ${selectedLicense.title}\nArchivos: ${selectedLicense.files}` : undefined
          }
        });
        targetOrderId = order.id;
      } catch {
        const order = await saveLocalOrder({
          userId: session.user.id,
          productId: product.id,
          product: { title: product.title },
          serviceType: selectedLicense ? `${product.type} / ${selectedLicense.title}` : product.type,
          totalAmount: productPrice,
          depositAmount,
          notes: selectedLicense ? `Licencia: ${selectedLicense.title}\nArchivos: ${selectedLicense.files}` : undefined
        });
        targetOrderId = order.id;
      }
      title = product.title;
      if (selectedLicense) title = `${product.title} (${selectedLicense.title})`;
      amount = mode === "deposit" ? depositAmount : productPrice;
      const downloadProduct = (await getProducts()).find((item) => item.id === productId);
      digitalDownloads = downloadProduct?.fileUrl ? `${downloadProduct.title}: ${downloadProduct.fileUrl}` : "";
    }

    if (orderId) {
      const order = await prisma.order.findFirst({ where: { id: orderId, userId: session.user.id } });
      if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
      title = order.serviceType ?? "Orden Ellbopa Music";
      amount = mode === "deposit" ? order.depositAmount : order.totalAmount - order.paidAmount;
      targetOrderId = order.id;
    }

    if (bookingId) {
      const booking = await prisma.booking.findFirst({ where: { id: bookingId, userId: session.user.id } });
      if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
      title = `Reserva: ${booking.serviceType}`;
      amount = booking.depositRequired - booking.depositPaid;
      targetBookingId = booking.id;
    }
  } catch (error) {
    console.error("[checkout][prepare]", error);
    return NextResponse.redirect(new URL("/gracias?tipo=pago", request.url));
  }

  if (amount === 0 && targetOrderId) {
    try {
      await prisma.order.update({
        where: { id: targetOrderId },
        data: { status: "PAID", paidAmount: 0, finalFilesUrl: digitalDownloads || undefined }
      });
    } catch {
      await updateLocalOrder(targetOrderId, { status: "PAID", paidAmount: 0, finalFilesUrl: digitalDownloads || undefined });
    }
    return NextResponse.redirect(new URL(`/compras?success=free&order=${targetOrderId}`, request.url), { status: 303 });
  }

  if (!amount) {
    return NextResponse.json({ error: "Checkout amount missing" }, { status: 400 });
  }

  if (paymentMethod === "transfer" || !hasStripeConfig()) {
    try {
      await prisma.payment.create({
        data: {
          userId: session.user.id,
          orderId: targetOrderId,
          bookingId: targetBookingId,
          stripeSessionId: `transfer-${Date.now()}`,
          amount
        }
      });
    } catch (error) {
      console.error("[checkout][manual payment local]", error);
      await saveLocalPayment({
        userId: session.user.id,
        orderId: targetOrderId,
        bookingId: targetBookingId,
        amount
      });
    }
    return NextResponse.redirect(new URL(`/pagos?manual=1&amount=${amount}&order=${targetOrderId ?? ""}&booking=${targetBookingId ?? ""}`, request.url), { status: 303 });
  }

  try {
    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "dop",
            unit_amount: amount * 100,
            product_data: { name: title }
          }
        }
      ],
      metadata: {
        userId: session.user.id,
        userEmail: session.user.email ?? "",
        orderId: targetOrderId ?? "",
        bookingId: targetBookingId ?? "",
        amount: String(amount),
        digitalDownloads
      },
      success_url: `${siteUrl}/compras?success=1`,
      cancel_url: `${siteUrl}/cliente?cancelled=1`
    });

    try {
      await prisma.payment.create({
        data: {
          userId: session.user.id,
          orderId: targetOrderId,
          bookingId: targetBookingId,
          stripeSessionId: checkout.id,
          amount,
          receiptUrl: checkout.url
        }
      });
    } catch (error) {
      console.error("[checkout][stripe payment local]", error);
      await saveLocalPayment({
        userId: session.user.id,
        orderId: targetOrderId,
        bookingId: targetBookingId,
        stripeSessionId: checkout.id,
        amount,
        receiptUrl: checkout.url
      });
    }

    return NextResponse.redirect(checkout.url ?? `${siteUrl}/cliente`, { status: 303 });
  } catch (error) {
    console.error("[checkout][stripe]", error);
    return NextResponse.redirect(new URL("/gracias?tipo=pago", request.url));
  }
}

function parseCart(value: string) {
  try {
    const parsed = JSON.parse(value) as CartItem[];
    return parsed.filter((item) => item?.id);
  } catch {
    return [];
  }
}
