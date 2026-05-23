import { unstable_noStore as noStore } from "next/cache";
import { promises as fs } from "node:fs";
import path from "node:path";

export type VisitorActivity = {
  visitorId: string;
  path: string;
  email?: string | null;
  name?: string | null;
  role?: string | null;
  userAgent?: string | null;
  firstSeen: string;
  lastSeen: string;
};

const activityPath = path.join(process.cwd(), "data", "activity.json");
const ACTIVE_WINDOW_MS = 5 * 60 * 1000;

async function readActivity() {
  noStore();
  try {
    const raw = await fs.readFile(activityPath, "utf8");
    return JSON.parse(raw) as VisitorActivity[];
  } catch {
    return [];
  }
}

export async function recordActivity(input: Omit<VisitorActivity, "firstSeen" | "lastSeen">) {
  const now = new Date().toISOString();
  const current = await readActivity();
  const existing = current.find((item) => item.visitorId === input.visitorId);
  const nextItem: VisitorActivity = {
    ...existing,
    ...input,
    firstSeen: existing?.firstSeen ?? now,
    lastSeen: now
  };

  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  const next = [nextItem, ...current.filter((item) => item.visitorId !== input.visitorId)]
    .filter((item) => new Date(item.lastSeen).getTime() >= cutoff)
    .slice(0, 300);

  await fs.mkdir(path.dirname(activityPath), { recursive: true });
  await fs.writeFile(activityPath, JSON.stringify(next, null, 2), "utf8");
  return nextItem;
}

export async function getActivity() {
  const activity = await readActivity();
  const now = Date.now();
  const active = activity.filter((item) => now - new Date(item.lastSeen).getTime() <= ACTIVE_WINDOW_MS);
  return {
    active,
    recent: activity.slice(0, 30),
    activeCount: active.length
  };
}
