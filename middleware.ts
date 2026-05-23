import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { dashboardForRole, normalizeRole } from "@/lib/roles";

const protectedDashboards = [
  ["/dashboard/artist", "ARTIST"],
  ["/dashboard/producer", "PRODUCER"],
  ["/dashboard/engineer", "ENGINEER"],
  ["/dashboard/studio", "STUDIO"]
] as const;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({ req: request, secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET });

  if (!token && (pathname.startsWith("/dashboard") || pathname.startsWith("/admin") || pathname.startsWith("/onboarding"))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!token) return NextResponse.next();

  const role = normalizeRole(token.role as string | undefined);
  const onboardingCompleted = Boolean(token.onboardingCompleted || role === "ADMIN");

  if (!onboardingCompleted && pathname !== "/onboarding" && !pathname.startsWith("/api/onboarding") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL(dashboardForRole(role), request.url));
  }

  for (const [prefix, allowedRole] of protectedDashboards) {
    if (pathname.startsWith(prefix) && role !== "ADMIN" && role !== allowedRole) {
      return NextResponse.redirect(new URL(dashboardForRole(role), request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/onboarding"]
};
