import { normalizeRole } from "@/lib/roles";

export const OWNER_ADMIN_EMAIL = "ellbopamusic@gmail.com";

export function isOwnerAdminEmail(email?: string | null) {
  return email?.trim().toLowerCase() === OWNER_ADMIN_EMAIL;
}

export function isAdminUser(user?: { email?: string | null; role?: string | null } | null) {
  return isOwnerAdminEmail(user?.email) && normalizeRole(user?.role) === "ADMIN";
}
