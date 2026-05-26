import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { isAdminUser, isOwnerAdminEmail } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

const roleSchema = z.object({
  userId: z.string().min(1),
  action: z.literal("role"),
  role: z.enum([Role.ARTIST, Role.PRODUCER, Role.ENGINEER, Role.STUDIO])
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || !isAdminUser(session.user)) {
    return NextResponse.redirect(new URL("/", request.url), { status: 303 });
  }

  const formData = await request.formData();
  const parsed = roleSchema.safeParse({
    userId: String(formData.get("userId") || ""),
    action: String(formData.get("action") || ""),
    role: String(formData.get("role") || "")
  });

  if (!parsed.success) {
    return NextResponse.redirect(new URL("/admin/users?error=invalid-role", request.url), { status: 303 });
  }

  const target = await prisma.user.findUnique({
    where: { id: parsed.data.userId },
    select: { id: true, email: true }
  });

  if (!target) {
    return NextResponse.redirect(new URL("/admin/users?error=user-not-found", request.url), { status: 303 });
  }

  if (isOwnerAdminEmail(target.email)) {
    return NextResponse.redirect(new URL("/admin/users?protected=owner-admin", request.url), { status: 303 });
  }

  await prisma.user.update({
    where: { id: target.id },
    data: {
      role: parsed.data.role,
      accountType: parsed.data.role,
      onboardingCompleted: true
    }
  });

  return NextResponse.redirect(new URL("/admin/users?updated=1", request.url), { status: 303 });
}
