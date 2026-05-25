import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { capturePayPalCheckout } from "@/lib/paypal";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.redirect(new URL("/login?next=compras", request.url));

  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  if (!token) return NextResponse.redirect(new URL("/compras?cancelled=1&provider=paypal&reason=missing-token", request.url));

  try {
    const result = await capturePayPalCheckout(token, session.user.id);
    if (!result.ok) {
      console.error("[paypal-capture]", { reason: result.reason });
      return NextResponse.redirect(new URL(`/compras?cancelled=1&provider=paypal&reason=${encodeURIComponent(result.reason ?? "capture-failed")}`, request.url));
    }
    return NextResponse.redirect(new URL(`/compras?success=1&provider=paypal&order=${encodeURIComponent(result.orderId ?? "")}`, request.url));
  } catch (error) {
    console.error("[paypal-capture][error]", error);
    return NextResponse.redirect(new URL("/compras?cancelled=1&provider=paypal&reason=capture-error", request.url));
  }
}
