import { unstable_noStore as noStore } from "next/cache";
import { promises as fs } from "node:fs";
import path from "node:path";

export type NotificationAudience = "ALL" | "ARTIST" | "PRODUCER" | "ENGINEER" | "STUDIO";

export type SiteNotification = {
  id: string;
  title: string;
  message: string;
  audience: NotificationAudience;
  active: boolean;
  createdAt: string;
};

const notificationsPath = path.join(process.cwd(), "data", "notifications.json");

async function readNotifications() {
  noStore();
  try {
    const raw = await fs.readFile(notificationsPath, "utf8");
    return JSON.parse(raw) as SiteNotification[];
  } catch {
    return [];
  }
}

export async function getNotifications() {
  return readNotifications();
}

export async function getActiveNotifications(role?: string | null) {
  const notifications = await readNotifications();
  return notifications
    .filter((notification) => notification.active)
    .filter((notification) => notification.audience === "ALL" || notification.audience === role)
    .slice(0, 5);
}

export async function createNotification(input: {
  title: string;
  message: string;
  audience?: NotificationAudience;
}) {
  const current = await readNotifications();
  const notification: SiteNotification = {
    id: `notification-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: input.title.trim(),
    message: input.message.trim(),
    audience: input.audience ?? "ALL",
    active: true,
    createdAt: new Date().toISOString()
  };

  const next = [notification, ...current].slice(0, 100);
  await fs.mkdir(path.dirname(notificationsPath), { recursive: true });
  await fs.writeFile(notificationsPath, JSON.stringify(next, null, 2), "utf8");
  return notification;
}

export async function setNotificationActive(id: string, active: boolean) {
  const current = await readNotifications();
  const next = current.map((notification) => notification.id === id ? { ...notification, active } : notification);
  await fs.mkdir(path.dirname(notificationsPath), { recursive: true });
  await fs.writeFile(notificationsPath, JSON.stringify(next, null, 2), "utf8");
}
