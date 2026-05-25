import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { createCommunityPost } from "@/lib/community";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";

const postSchema = z.object({
  text: z.string().trim().min(3).max(500)
});

export async function POST(request: Request) {
  if (isRateLimited(`community:${getClientIp(request)}`, 10, 60_000)) {
    return NextResponse.json({ error: "Too many community posts" }, { status: 429 });
  }

  const session = await auth();
  if (!session?.user?.id) return NextResponse.redirect(new URL("/login?next=/comunidad", request.url));

  const formData = await request.formData();
  const parsed = postSchema.safeParse({ text: String(formData.get("text") ?? "") });
  if (!parsed.success) return NextResponse.redirect(new URL("/comunidad?error=post", request.url));

  await createCommunityPost({
    userId: session.user.id,
    authorName: session.user.name,
    authorRole: session.user.role,
    text: parsed.data.text
  });

  return NextResponse.redirect(new URL("/comunidad?posted=1", request.url));
}
