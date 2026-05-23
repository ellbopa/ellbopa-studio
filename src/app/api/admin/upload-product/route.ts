import { NextResponse } from "next/server";
import { ProductType } from "@prisma/client";
import { auth } from "@/lib/auth";
import { saveLocalProduct, saveUpload } from "@/lib/local-products";
import { isConfiguredAdminEmail } from "@/lib/config";
import { canUploadProducts } from "@/lib/roles";

export async function POST(request: Request) {
  const session = await auth();
  if (!canUploadProducts(session?.user?.role) && !isConfiguredAdminEmail(session?.user?.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const type = String(formData.get("type") ?? "BEAT") as ProductType;
  const title = String(formData.get("title") ?? "Producto Ellbopa");
  const id = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;

  const imageUrl = await saveUpload(formData.get("image") as File | null, "images");
  const audioUrl = await saveUpload(formData.get("audio") as File | null, "audio");
  const fileUrl = await saveUpload(formData.get("file") as File | null, "digital");

  await saveLocalProduct({
    id,
    title,
    type,
    genre: String(formData.get("genre") ?? ""),
    bpm: Number(formData.get("bpm") || 0) || null,
    musicalKey: String(formData.get("musicalKey") ?? ""),
    mood: String(formData.get("mood") ?? ""),
    description: String(formData.get("description") ?? ""),
    price: Number(formData.get("price") || 0),
    premiumPrice: Number(formData.get("premiumPrice") || 0) || null,
    exclusivePrice: Number(formData.get("exclusivePrice") || 0) || null,
    imageUrl: imageUrl || (type === "PRESET" ? "/images/preset-cover.svg" : "/images/beat-cover.svg"),
    audioUrl,
    fileUrl,
    active: true,
    createdAt: new Date().toISOString()
  });

  const redirectTo = session?.user?.role === "PRODUCER" ? "/dashboard/producer?uploaded=1" : "/admin?uploaded=1";
  return NextResponse.redirect(new URL(redirectTo, request.url));
}
