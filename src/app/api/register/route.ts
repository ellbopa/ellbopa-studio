import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createAndSendOtp } from "@/lib/otp";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(6),
  accountType: z.string().optional(),
  artistName: z.string().optional(),
  artistCount: z.string().optional(),
  managedArtists: z.string().optional()
});

export async function POST(request: Request) {
  if (isRateLimited(`register:${getClientIp(request)}`, 6, 60_000)) {
    return NextResponse.redirect(new URL("/registro?error=rate", request.url));
  }

  const formData = await request.formData();
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return NextResponse.redirect(new URL("/cliente/registro?error=invalid", request.url));
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        passwordHash,
        accountType: parsed.data.accountType || "ARTIST",
        artistName: parsed.data.artistName,
        artistCount: Number(parsed.data.artistCount || 0) || null,
        managedArtists: parsed.data.managedArtists
      }
    });
    await createAndSendOtp(user.id, user.email);
  } catch {
    return NextResponse.redirect(new URL("/registro?error=unavailable", request.url));
  }

  return NextResponse.redirect(new URL(`/verify?email=${encodeURIComponent(parsed.data.email)}`, request.url));
}
