import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveUpload } from "@/lib/local-products";
import { saveLocalOrder } from "@/lib/local-workflow";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";

const orderSchema = z.object({
  serviceType: z.string().trim().min(2).max(120),
  totalAmount: z.coerce.number().int().min(1000).max(250000),
  referenceArtist: z.string().trim().max(120).optional(),
  bpm: z.coerce.number().int().min(0).max(300).optional(),
  musicalKey: z.string().trim().max(20).optional(),
  genre: z.string().trim().max(80).optional(),
  notes: z.string().trim().max(1500).optional()
});

export async function POST(request: Request) {
  if (isRateLimited(`orders:${getClientIp(request)}`, 12, 60_000)) {
    return NextResponse.json({ error: "Too many order attempts" }, { status: 429 });
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login?next=mezcla-online", request.url));
  }
  if (!session.user.verified) {
    return NextResponse.redirect(new URL("/verify", request.url));
  }

  const formData = await request.formData();
  const parsed = orderSchema.safeParse({
    serviceType: String(formData.get("serviceType") ?? "Mezcla y Master Online"),
    totalAmount: String(formData.get("totalAmount") ?? "5000"),
    referenceArtist: String(formData.get("referenceArtist") ?? ""),
    bpm: String(formData.get("bpm") ?? "0"),
    musicalKey: String(formData.get("musicalKey") ?? ""),
    genre: String(formData.get("genre") ?? ""),
    notes: String(formData.get("notes") ?? "")
  });
  if (!parsed.success) return NextResponse.redirect(new URL("/mezcla-online?error=validation", request.url));

  const { serviceType, totalAmount } = parsed.data;
  const upload = formData.get("files") as File | null;
  const uploadedUrl = await saveUpload(upload, "orders");
  const notes = [
    parsed.data.notes ?? "",
    `Artista: ${String(formData.get("artistName") ?? "")}`,
    `Pais/Ciudad: ${String(formData.get("country") ?? "")}`,
    `Cliente: ${String(formData.get("clientType") ?? "")}`,
    `Archivos: ${String(formData.get("fileType") ?? "")}`
  ].filter(Boolean).join("\n");

  try {
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        serviceType,
        totalAmount,
        depositAmount: Math.ceil(totalAmount * 0.5),
        referenceArtist: parsed.data.referenceArtist,
        bpm: parsed.data.bpm || null,
        musicalKey: parsed.data.musicalKey,
        genre: parsed.data.genre,
        notes,
        filesUrl: uploadedUrl || (upload?.name ? `pending-upload://${upload.name}` : null)
      }
    });

    return NextResponse.redirect(new URL(`/cliente?order=${order.id}`, request.url));
  } catch (error) {
    console.error("[orders][create]", error);
    const order = await saveLocalOrder({
      userId: session.user.id,
      serviceType,
      totalAmount,
      depositAmount: Math.ceil(totalAmount * 0.5),
      referenceArtist: parsed.data.referenceArtist,
      bpm: parsed.data.bpm || null,
      musicalKey: parsed.data.musicalKey,
      genre: parsed.data.genre,
      notes,
      filesUrl: uploadedUrl || (upload?.name ? `pending-upload://${upload.name}` : null)
    });
    return NextResponse.redirect(new URL(`/cliente?order=${order.id}&local=1`, request.url));
  }
}
