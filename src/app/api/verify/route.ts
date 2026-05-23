import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";

export async function POST(request: Request) {
  if (isRateLimited(`verify:${getClientIp(request)}`, 12, 60_000)) {
    return NextResponse.redirect(new URL("/verify?error=rate", request.url));
  }

  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").toLowerCase();
  const code = String(formData.get("code") ?? "");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.redirect(new URL("/verify?error=user", request.url));

  const verification = await prisma.verificationCode.findFirst({
    where: { userId: user.id, used: false },
    orderBy: { createdAt: "desc" }
  });

  if (!verification) return NextResponse.redirect(new URL(`/verify?email=${email}&error=missing`, request.url));
  if (verification.attempts >= 5) return NextResponse.redirect(new URL(`/verify?email=${email}&error=attempts`, request.url));
  if (verification.expiresAt < new Date()) return NextResponse.redirect(new URL(`/verify?email=${email}&error=expired`, request.url));

  if (verification.code !== code) {
    await prisma.verificationCode.update({
      where: { id: verification.id },
      data: { attempts: { increment: 1 } }
    });
    return NextResponse.redirect(new URL(`/verify?email=${email}&error=code`, request.url));
  }

  await prisma.$transaction([
    prisma.verificationCode.update({ where: { id: verification.id }, data: { used: true } }),
    prisma.user.update({
      where: { id: user.id },
      data: { verified: true, emailVerified: new Date() }
    })
  ]);

  return NextResponse.redirect(new URL("/login?verified=1", request.url));
}
