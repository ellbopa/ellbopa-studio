import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const image = String(body.image ?? "").trim();
  if (!image || image.length > 600) return NextResponse.json({ error: "Imagen invalida" }, { status: 400 });
  await prisma.user.update({ where: { id: session.user.id }, data: { image } });
  return NextResponse.json({ ok: true, image });
}
