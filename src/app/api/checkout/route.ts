import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getProducts } from "@/lib/products";
import { saveLocalOrder, saveLocalPayment, updateLocalOrder } from "@/lib/local-workflow";
import type { CartItem } from "@/lib/cart";
import { findLicenseOption } from "@/lib/licensing";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";
import { ensurePrismaProduct } from "@/lib/catalog-product-sync";
import { createPayPalCheckout, hasPayPalConfig } from "@/lib/paypal";

type CheckoutProduct = {
  id: string;
  title: string;
  type: string;
  price: number;
  ownerId?: string | null;
  imageUrl?: string | null;
  audioUrl?: string | null;
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
  const paymentMethod = String(formData.get("paymentMethod") ?? "paypal");
  const license = String(formData.get("license") ?? "basic");
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;

  let title = "Ellbopa Music";
  let amount = 0;
  let targetOrderId: string | undefined;
  let targetBookingId: string | undefined;

  if (paymentMethod !== "paypal" && paymentMethod !== "transfer") {
    return NextResponse.redirect(new URL(`/checkout?${productId ? `productId=${encodeURIComponent(productId)}&` : ""}error=payment-method-disabled`, request.url), { status: 303 });
  }

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
            licenseTitle: option?.title ?? cartItem.licenseLabel ?? null,
            licenseType: option?.key ?? cartItem.license ?? "digital",
            price: option?.price ?? product.price
          };
        })
        .filter(Boolean) as Array<{ product: CheckoutProduct & { fileUrl?: string | null; genre?: string | null }; title: string; type: string; genre?: string | null; licenseTitle?: string | null; licenseType: string; price: number }>;

      if (selected.length === 0) return NextResponse.json({ error: "Products not found" }, { status: 404 });
      if (selected.some((item) => isDigitalProduct(item.type) && !item.product.fileUrl)) {
        return NextResponse.redirect(new URL("/carrito?error=missing-file", request.url), { status: 303 });
      }

      for (const item of selected) {
        const syncedProduct = await ensurePrismaProduct(item.product.id, item.product, item.product.ownerId);
        if (!syncedProduct) return NextResponse.json({ error: "Product could not be synced" }, { status: 500 });
        item.product = { ...item.product, ownerId: syncedProduct.ownerId, fileUrl: syncedProduct.fileUrl };
      }

      amount = selected.reduce((sum, product) => sum + product.price, 0);
      title = selected.length === 1 ? selected[0].title : `Compra Ellbopa (${selected.length} productos)`;

      try {
        const order = await prisma.order.create({
          data: {
            userId: session.user.id,
            productId: selected.length === 1 ? selected[0].product.id : undefined,
            creatorId: selected.length === 1 ? selected[0].product.ownerId ?? undefined : undefined,
            serviceType: title,
            totalAmount: amount,
            depositAmount: amount,
            finalFilesUrl: selected
              .filter((item) => isDigitalProduct(item.type) && item.product.fileUrl)
              .map((item) => `${item.title}: ${item.product.fileUrl}`)
              .join("\n") || undefined,
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
      const syncedProduct = await ensurePrismaProduct(product.id, product, product.ownerId);
      if (syncedProduct) {
        product = {
          ...product,
          ownerId: syncedProduct.ownerId,
          fileUrl: syncedProduct.fileUrl,
          audioUrl: syncedProduct.audioUrl,
          imageUrl: syncedProduct.imageUrl,
          premiumPrice: syncedProduct.premiumPrice,
          exclusivePrice: syncedProduct.exclusivePrice
        };
      }
      if (isDigitalProduct(product.type) && !product.fileUrl) {
        return NextResponse.redirect(new URL(`/checkout?productId=${encodeURIComponent(product.id)}&error=missing-file`, request.url), { status: 303 });
      }
      const selectedLicense = product.type === "BEAT" ? findLicenseOption(product, license) : null;
      const productPrice = selectedLicense?.price ?? product.price;
      const depositAmount = Math.ceil(productPrice * 0.5);
      try {
        const order = await prisma.order.create({
          data: {
            userId: session.user.id,
            productId: product.id,
            creatorId: product.ownerId ?? undefined,
            serviceType: selectedLicense ? `${product.type} / ${selectedLicense.title}` : product.type,
            totalAmount: productPrice,
            depositAmount,
            finalFilesUrl: isDigitalProduct(product.type) && product.fileUrl ? `${product.title}: ${product.fileUrl}` : undefined,
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
        data: { status: "PAID", paidAmount: 0 }
      });
    } catch {
      await updateLocalOrder(targetOrderId, { status: "PAID", paidAmount: 0 });
    }
    return NextResponse.redirect(new URL(`/compras?success=free&order=${targetOrderId}`, request.url), { status: 303 });
  }

  if (!amount) {
    return NextResponse.json({ error: "Checkout amount missing" }, { status: 400 });
  }

  if (paymentMethod === "transfer") {
    try {
      await prisma.payment.create({
        data: {
          userId: session.user.id,
          orderId: targetOrderId,
          bookingId: targetBookingId,
          stripeSessionId: `transfer-${Date.now()}`,
          method: "TRANSFER",
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

  if (paymentMethod === "paypal") {
    if (!hasPayPalConfig()) {
      return NextResponse.redirect(new URL(`/checkout?${productId ? `productId=${encodeURIComponent(productId)}&` : ""}error=paypal-not-configured`, request.url), { status: 303 });
    }

    try {
      const paypal = await createPayPalCheckout({
        userId: session.user.id,
        orderId: targetOrderId,
        bookingId: targetBookingId,
        title,
        amount,
        returnUrl: `${siteUrl}/api/paypal/capture`,
        cancelUrl: `${siteUrl}/compras?cancelled=1&provider=paypal`
      });

      await prisma.payment.create({
        data: {
          userId: session.user.id,
          orderId: targetOrderId,
          bookingId: targetBookingId,
          stripeSessionId: `paypal-${paypal.paypalOrderId}`,
          method: "PAYPAL",
          amount,
          receiptUrl: paypal.approvalUrl
        }
      });

      return NextResponse.redirect(paypal.approvalUrl, { status: 303 });
    } catch (error) {
      console.error("[checkout][paypal]", error);
      return NextResponse.redirect(new URL("/compras?cancelled=1&provider=paypal", request.url), { status: 303 });
    }
  }

  return NextResponse.redirect(new URL(`/checkout?${productId ? `productId=${encodeURIComponent(productId)}&` : ""}error=payment-method-disabled`, request.url), { status: 303 });
}

function parseCart(value: string) {
  try {
    const parsed = JSON.parse(value) as CartItem[];
    return parsed.filter((item) => item?.id);
  } catch {
    return [];
  }
}

function isDigitalProduct(type?: string | null) {
  return type === "BEAT" || type === "PRESET" || type === "SOUND_KIT";
}
