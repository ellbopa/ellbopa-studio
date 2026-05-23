import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { recordActivity } from "@/lib/activity";

export async function POST(request: Request) {
  const session = await auth();
  const body = (await request.json().catch(() => ({}))) as {
    visitorId?: string;
    path?: string;
    userAgent?: string;
  };

  if (!body.visitorId) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  await recordActivity({
    visitorId: body.visitorId,
    path: body.path || "/",
    userAgent: body.userAgent || request.headers.get("user-agent"),
    email: session?.user?.email,
    name: session?.user?.name,
    role: session?.user?.role
  });

  return NextResponse.json({ ok: true });
}
