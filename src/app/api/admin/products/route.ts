import { NextResponse } from "next/server";
import { ProductType } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isConfiguredAdminEmail } from "@/lib/config";

export async function POST(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN" && !isConfiguredAdminEmail(session?.user?.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();

  try {
    await prisma.product.create({
      data: {
        title: String(formData.get("title")),
        type: String(formData.get("type")) as ProductType,
        genre: String(formData.get("genre") ?? ""),
        bpm: Number(formData.get("bpm") || 0) || null,
        musicalKey: String(formData.get("musicalKey") ?? ""),
        mood: String(formData.get("mood") ?? ""),
        description: String(formData.get("description")),
        price: Number(formData.get("price")),
        audioUrl: String(formData.get("audioUrl") ?? ""),
        imageUrl: String(formData.get("imageUrl") ?? "/images/beat-cover.svg"),
        fileUrl: String(formData.get("fileUrl") ?? "")
      }
    });
  } catch (error) {
    console.error("[admin][product create]", error);
  }

  return NextResponse.redirect(new URL("/admin", request.url));
}
