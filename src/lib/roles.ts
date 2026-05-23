import type { EllbopaRole } from "@/types/next-auth";

export const roleLabels: Record<EllbopaRole, string> = {
  ARTIST: "Artista",
  PRODUCER: "Productor musical",
  ENGINEER: "Ingeniero de mezcla/mastering",
  STUDIO: "Estudio",
  ADMIN: "Admin"
};

export const dashboardByRole: Record<EllbopaRole, string> = {
  ARTIST: "/dashboard/artist",
  PRODUCER: "/dashboard/producer",
  ENGINEER: "/dashboard/engineer",
  STUDIO: "/dashboard/studio",
  ADMIN: "/admin"
};

export function normalizeRole(role?: string | null): EllbopaRole {
  if (role === "CLIENT") return "ARTIST";
  if (role === "PRODUCER" || role === "ENGINEER" || role === "STUDIO" || role === "ADMIN" || role === "ARTIST") return role;
  return "ARTIST";
}

export function dashboardForRole(role?: string | null) {
  return dashboardByRole[normalizeRole(role)];
}

export function canAccessRoleDashboard(userRole: string | null | undefined, dashboardRole: EllbopaRole) {
  const normalized = normalizeRole(userRole);
  return normalized === "ADMIN" || normalized === dashboardRole;
}

export function canUploadProducts(userRole?: string | null) {
  const normalized = normalizeRole(userRole);
  return normalized === "ADMIN" || normalized === "PRODUCER";
}
