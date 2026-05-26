import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ensureUsernameAvailable, profileSettingsSchema, updateUserProfile } from "@/lib/user-settings";

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const parsed = profileSettingsSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Datos invalidos", issues: parsed.error.flatten() }, { status: 400 });

  if (parsed.data.username && !(await ensureUsernameAvailable(parsed.data.username, session.user.id))) {
    return NextResponse.json({ error: "Ese username no esta disponible." }, { status: 409 });
  }

  const user = await updateUserProfile(session.user.id, parsed.data);
  return NextResponse.json({ ok: true, user: { id: user.id, username: user.username, image: user.image, bannerImage: user.bannerImage } });
}
