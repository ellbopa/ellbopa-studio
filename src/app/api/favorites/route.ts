import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { toggleFavorite } from "@/lib/favorites";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";

const favoriteSchema = z.object({
  productId: z.string().trim().min(1),
  next: z.string().optional()
});

export async function POST(request: Request) {
  if (isRateLimited(`favorite:${getClientIp(request)}`, 60, 60_000)) {
    return NextResponse.json({ error: "Too many favorite actions" }, { status: 429 });
  }

  const session = await auth();
  if (!session?.user?.id) return NextResponse.redirect(new URL("/login?next=/beats", request.url));

  const formData = await request.formData();
  const parsed = favoriteSchema.safeParse({
    productId: String(formData.get("productId") ?? ""),
    next: String(formData.get("next") ?? "")
  });

  if (!parsed.success) return NextResponse.redirect(new URL("/beats?favorite=error", request.url));

  await toggleFavorite(session.user.id, parsed.data.productId);
  return NextResponse.redirect(new URL(parsed.data.next || "/beats", request.url), { status: 303 });
}
