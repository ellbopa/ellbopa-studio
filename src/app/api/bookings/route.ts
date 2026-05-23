import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveLocalBooking } from "@/lib/local-workflow";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login?next=reservas", request.url));
  }
  if (!session.user.verified) {
    return NextResponse.redirect(new URL("/verify", request.url));
  }

  const formData = await request.formData();
  const serviceType = String(formData.get("serviceType") ?? "");
  const date = String(formData.get("date") ?? "");
  const time = String(formData.get("time") ?? "");
  const notes = String(formData.get("notes") ?? "");
  const total = Number(formData.get("totalAmount") ?? 5000);

  try {
    const booking = await prisma.booking.create({
      data: {
        userId: session.user.id,
        serviceType,
        date: new Date(`${date}T00:00:00`),
        time,
        notes,
        depositRequired: Math.ceil(total * 0.5)
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
      depositRequired: Math.ceil(total * 0.5)
    });
    return NextResponse.redirect(new URL(`/cliente?booking=${booking.id}&local=1`, request.url));
  }
}
