import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAndSendOtp } from "@/lib/otp";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";

export async function POST(request: Request) {
  if (isRateLimited(`verify-resend:${getClientIp(request)}`, 3, 60_000)) {
    return NextResponse.redirect(new URL("/verify?error=rate", request.url));
  }

  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) return NextResponse.redirect(new URL("/verify?error=user", request.url));
  if (user.verified) return NextResponse.redirect(new URL("/login?verified=1", request.url));

  try {
    await createAndSendOtp(user.id, user.email);
  } catch {
    return NextResponse.redirect(new URL(`/verify?email=${email}&error=rate`, request.url));
  }

  return NextResponse.redirect(new URL(`/verify?email=${email}&resent=1`, request.url));
}
