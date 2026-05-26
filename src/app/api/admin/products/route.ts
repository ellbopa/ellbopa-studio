import { NextResponse } from "next/server";
import { ProductType } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdminUser } from "@/lib/admin";
import { normalizeMusicalKey } from "@/lib/music-keys";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !isAdminUser(session.user)) {
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
        musicalKey: normalizeMusicalKey(String(formData.get("musicalKey") ?? "")),
        mood: String(formData.get("mood") ?? ""),
        description: String(formData.get("description")),
        price: Number(formData.get("price")),
        audioUrl: String(formData.get("audioUrl") ?? ""),
        imageUrl: String(formData.get("imageUrl") ?? "/images/beat-cover.svg"),
        fileUrl: String(formData.get("fileUrl") ?? ""),
        ownerId: session.user.id
      }
    });
  } catch (error) {
    console.error("[admin][product create]", error);
  }

  return NextResponse.redirect(new URL("/admin", request.url));
}
