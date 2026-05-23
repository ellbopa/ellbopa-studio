import crypto from "crypto";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").toLowerCase();
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");

  if (password.length < 6) {
    return NextResponse.redirect(new URL(`/reset-password?email=${email}&token=${token}&error=password`, request.url));
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.redirect(new URL("/forgot-password?error=user", request.url));

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const reset = await prisma.passwordResetToken.findFirst({
    where: { userId: user.id, tokenHash, used: false },
    orderBy: { createdAt: "desc" }
  });

  if (!reset || reset.expiresAt < new Date()) {
    return NextResponse.redirect(new URL("/forgot-password?error=expired", request.url));
  }

  await prisma.$transaction([
    prisma.passwordResetToken.update({ where: { id: reset.id }, data: { used: true } }),
    prisma.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(password, 10) } })
  ]);

  return NextResponse.redirect(new URL("/login?reset=1", request.url));
}
