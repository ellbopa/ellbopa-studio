import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendResetEmail } from "@/lib/email";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    await prisma.passwordResetToken.updateMany({ where: { userId: user.id, used: false }, data: { used: true } });
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000)
      }
    });
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
    await sendResetEmail(user.email, `${siteUrl}/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`);
  }

  return NextResponse.redirect(new URL("/forgot-password?sent=1", request.url));
}
