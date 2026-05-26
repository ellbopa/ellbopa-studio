import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { isAdminUser } from "@/lib/admin";
import { getSiteConfig, saveSiteConfig } from "@/lib/site-config";

const colorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/);

export async function POST(request: Request) {
  const session = await auth();
  if (!isAdminUser(session?.user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const preset = String(formData.get("presetColor") || "");
  const custom = String(formData.get("primaryColor") || "");
  const color = preset || custom;
  const parsed = colorSchema.safeParse(color);
  if (!parsed.success) {
    return NextResponse.redirect(new URL("/admin/appearance?error=color", request.url), { status: 303 });
  }

  const current = await getSiteConfig();
  await saveSiteConfig({
    ...current,
    primaryColor: parsed.data
  });

  return NextResponse.redirect(new URL("/admin/appearance?saved=1", request.url), { status: 303 });
}
