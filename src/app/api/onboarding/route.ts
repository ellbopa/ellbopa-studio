import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { completeRoleOnboarding } from "@/lib/profile-actions";
import { dashboardForRole } from "@/lib/roles";
import { updateLocalUserRole } from "@/lib/local-users";

const schema = z.object({
  role: z.enum(["ARTIST", "PRODUCER", "ENGINEER", "STUDIO"]),
  displayName: z.string().trim().max(80).optional(),
  bio: z.string().trim().max(500).optional(),
  location: z.string().trim().max(120).optional(),
  genres: z.string().trim().max(160).optional(),
  instagram: z.string().trim().max(160).optional(),
  startingPrice: z.coerce.number().int().min(0).optional()
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.redirect(new URL("/login", request.url));

  const formData = await request.formData();
  const parsed = schema.safeParse({
    role: String(formData.get("role") ?? ""),
    displayName: String(formData.get("displayName") ?? ""),
    bio: String(formData.get("bio") ?? ""),
    location: String(formData.get("location") ?? ""),
    genres: String(formData.get("genres") ?? ""),
    instagram: String(formData.get("instagram") ?? ""),
    startingPrice: String(formData.get("startingPrice") ?? "0")
  });
  if (!parsed.success) return NextResponse.redirect(new URL("/onboarding?error=role", request.url));

  try {
    await completeRoleOnboarding(session.user.id, parsed.data.role, session.user.name, parsed.data);
  } catch (error) {
    console.error("[onboarding]", error);
    if (session.user.id.startsWith("local-user-")) {
      await updateLocalUserRole(session.user.id, parsed.data.role);
    } else {
      return NextResponse.redirect(new URL("/onboarding?error=save", request.url));
    }
  }

  return NextResponse.redirect(new URL(dashboardForRole(parsed.data.role), request.url));
}
