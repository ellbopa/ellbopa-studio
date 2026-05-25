import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveLocalBooking } from "@/lib/local-workflow";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";

const bookingSchema = z.object({
  serviceType: z.string().trim().min(2).max(120),
  date: z.string().trim().min(8).max(20),
  time: z.string().trim().min(3).max(20),
  notes: z.string().trim().max(1000).optional(),
  totalAmount: z.coerce.number().int().min(1000).max(250000)
});

export async function POST(request: Request) {
  if (isRateLimited(`bookings:${getClientIp(request)}`, 12, 60_000)) {
    return NextResponse.json({ error: "Too many booking attempts" }, { status: 429 });
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login?next=reservas", request.url));
  }
  if (!session.user.verified) {
    return NextResponse.redirect(new URL("/verify", request.url));
  }

  const formData = await request.formData();
  const parsed = bookingSchema.safeParse({
    serviceType: String(formData.get("serviceType") ?? ""),
    date: String(formData.get("date") ?? ""),
    time: String(formData.get("time") ?? ""),
    notes: String(formData.get("notes") ?? ""),
    totalAmount: String(formData.get("totalAmount") ?? "5000")
  });
  if (!parsed.success) return NextResponse.redirect(new URL("/reservas?error=validation", request.url));

  const { serviceType, date, time, notes, totalAmount } = parsed.data;

  try {
    const booking = await prisma.booking.create({
      data: {
        userId: session.user.id,
        serviceType,
        date: new Date(`${date}T00:00:00`),
        time,
        notes,
        depositRequired: Math.ceil(totalAmount * 0.5)
      }
    });

    return NextResponse.redirect(new URL(`/cliente?booking=${booking.id}`, request.url));
  } catch (error) {
    console.error("[bookings][create]", error);
    const booking = await saveLocalBooking({
      userId: session.user.id,
      serviceType,
      date,
      time,
      notes,
      depositRequired: Math.ceil(totalAmount * 0.5)
    });
    return NextResponse.redirect(new URL(`/cliente?booking=${booking.id}&local=1`, request.url));
  }
}
