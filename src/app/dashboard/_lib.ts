import { redirect } from "next/navigation";
import type { EllbopaRole } from "@/types/next-auth";
import { auth } from "@/lib/auth";
import { canAccessRoleDashboard, dashboardForRole } from "@/lib/roles";

export async function requireDashboardRole(role: EllbopaRole) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "ADMIN" && !session.user.onboardingCompleted) redirect("/onboarding");
  if (!canAccessRoleDashboard(session.user.role, role)) redirect(dashboardForRole(session.user.role));
  return session;
}
