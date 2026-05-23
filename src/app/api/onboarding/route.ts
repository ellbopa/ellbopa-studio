import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { completeRoleOnboarding } from "@/lib/profile-actions";
import { dashboardForRole } from "@/lib/roles";

const schema = z.object({
  role: z.enum(["ARTIST", "PRODUCER", "ENGINEER", "STUDIO"])
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.redirect(new URL("/login", request.url));

  const formData = await request.formData();
  const parsed = schema.safeParse({ role: String(formData.get("role") ?? "") });
  if (!parsed.success) return NextResponse.redirect(new URL("/onboarding?error=role", request.url));

  try {
    await completeRoleOnboarding(session.user.id, parsed.data.role, session.user.name);
  } catch (error) {
    console.error("[onboarding]", error);
    return NextResponse.redirect(new URL("/onboarding?error=save", request.url));
  }

  return NextResponse.redirect(new URL(dashboardForRole(parsed.data.role), request.url));
}
