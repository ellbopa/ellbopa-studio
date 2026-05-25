import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isConfiguredAdminEmail } from "@/lib/config";
import { createNotification, setNotificationActive, type NotificationAudience } from "@/lib/notifications";

const allowedAudiences = new Set(["ALL", "ARTIST", "PRODUCER", "ENGINEER", "STUDIO"]);

export async function POST(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN" && !isConfiguredAdminEmail(session?.user?.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const action = String(formData.get("action") ?? "create");

  if (action === "deactivate" || action === "activate") {
    const id = String(formData.get("id") ?? "");
    if (id) await setNotificationActive(id, action === "activate");
    return NextResponse.redirect(new URL("/admin?notification=updated#notifications", request.url));
  }

  const title = String(formData.get("title") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const rawAudience = String(formData.get("audience") ?? "ALL").trim().toUpperCase();
  const audience = allowedAudiences.has(rawAudience) ? rawAudience as NotificationAudience : "ALL";

  if (!title || !message) {
    return NextResponse.redirect(new URL("/admin?notification=missing#notifications", request.url));
  }

  await createNotification({ title, message, audience });

  return NextResponse.redirect(new URL("/admin?notification=sent#notifications", request.url));
}
