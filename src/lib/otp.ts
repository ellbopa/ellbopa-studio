import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendOtpEmail } from "@/lib/email";

export function generateOtp() {
  return crypto.randomInt(100000, 999999).toString();
}

export async function createAndSendOtp(userId: string, email: string) {
  const recent = await prisma.verificationCode.count({
    where: {
      userId,
      createdAt: { gt: new Date(Date.now() - 15 * 60 * 1000) }
    }
  });

  if (recent >= 3) {
    throw new Error("rate_limited");
  }

  await prisma.verificationCode.updateMany({
    where: { userId, used: false },
    data: { used: true }
  });

  const code = generateOtp();
  await prisma.verificationCode.create({
    data: {
      userId,
      code,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    }
  });

  await sendOtpEmail(email, code);
}
