export function isPlaceholder(value?: string | null) {
  if (!value) return true;
  return value.includes("change_me") || value.includes("change-me") || value.includes("missing");
}

export function hasStripeConfig() {
  return !isPlaceholder(process.env.STRIPE_SECRET_KEY);
}

export function hasGoogleConfig() {
  return !isPlaceholder(process.env.GOOGLE_CLIENT_ID) && !isPlaceholder(process.env.GOOGLE_CLIENT_SECRET);
}

export function hasFacebookConfig() {
  return !isPlaceholder(process.env.FACEBOOK_CLIENT_ID) && !isPlaceholder(process.env.FACEBOOK_CLIENT_SECRET);
}

export function hasAppleConfig() {
  return !isPlaceholder(process.env.APPLE_CLIENT_ID) && !isPlaceholder(process.env.APPLE_CLIENT_SECRET);
}

export function isConfiguredAdminEmail(email?: string | null) {
  if (!email) return false;
  return (process.env.ADMIN_EMAILS || "admin@ellbopastudio.com")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
    .includes(email.toLowerCase());
}
