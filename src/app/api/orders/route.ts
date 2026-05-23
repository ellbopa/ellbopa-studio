import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveUpload } from "@/lib/local-products";
import { saveLocalOrder } from "@/lib/local-workflow";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login?next=mezcla-online", request.url));
  }
  if (!session.user.verified) {
    return NextResponse.redirect(new URL("/verify", request.url));
  }

  const formData = await request.formData();
  const serviceType = String(formData.get("serviceType") ?? "Mezcla y Master Online");
  const totalAmount = Number(formData.get("totalAmount") ?? 5000);
  const upload = formData.get("files") as File | null;
  const uploadedUrl = await saveUpload(upload, "orders");
  const notes = [
    String(formData.get("notes") ?? ""),
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
        referenceArtist: String(formData.get("referenceArtist") ?? ""),
        bpm: Number(formData.get("bpm") || 0) || null,
        musicalKey: String(formData.get("musicalKey") ?? ""),
        genre: String(formData.get("genre") ?? ""),
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
      referenceArtist: String(formData.get("referenceArtist") ?? ""),
      bpm: Number(formData.get("bpm") || 0) || null,
      musicalKey: String(formData.get("musicalKey") ?? ""),
      genre: String(formData.get("genre") ?? ""),
      notes,
      filesUrl: uploadedUrl || (upload?.name ? `pending-upload://${upload.name}` : null)
    });
    return NextResponse.redirect(new URL(`/cliente?order=${order.id}&local=1`, request.url));
  }
}
