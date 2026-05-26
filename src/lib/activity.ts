import { unstable_noStore as noStore } from "next/cache";
import { promises as fs } from "node:fs";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { canUseDatabase } from "@/lib/db-availability";

export type VisitorActivity = {
  userId?: string | null;
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
  if (process.env.NODE_ENV === "production") return [];
  try {
    const raw = await fs.readFile(activityPath, "utf8");
    return JSON.parse(raw) as VisitorActivity[];
  } catch {
    return [];
  }
}

export async function recordActivity(input: Omit<VisitorActivity, "firstSeen" | "lastSeen">) {
  noStore();
  if (await canUseDatabase()) {
    try {
      const created = await prisma.pageView.create({
        data: {
          userId: input.userId || null,
          visitorId: input.visitorId,
          path: input.path || "/",
          userAgent: input.userAgent || null,
          email: input.email || null,
          name: input.name || null,
          role: input.role || null
        }
      });
      const productId = productIdFromPath(input.path);
      if (productId) {
        await prisma.productView.create({
          data: {
            productId,
            userId: input.userId || null,
            path: input.path || "/"
          }
        }).catch(() => null);
      }
      return {
        ...input,
        firstSeen: created.createdAt.toISOString(),
        lastSeen: created.createdAt.toISOString()
      };
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("[activity] database page view failed", error);
      }
    }
  }

  if (process.env.NODE_ENV === "production") {
    const now = new Date().toISOString();
    return {
      ...input,
      firstSeen: now,
      lastSeen: now
    };
  }

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

function productIdFromPath(pathValue?: string | null) {
  const match = pathValue?.match(/^\/producto\/([^/?#]+)/);
  return match ? decodeURIComponent(match[1]) : "";
}

export async function getActivity() {
  noStore();
  if (await canUseDatabase()) {
    try {
      const now = Date.now();
      const activeSince = new Date(now - ACTIVE_WINDOW_MS);
      const [recentRows, activeRows] = await Promise.all([
        prisma.pageView.findMany({ orderBy: { createdAt: "desc" }, take: 300 }),
        prisma.pageView.findMany({ where: { createdAt: { gte: activeSince } }, orderBy: { createdAt: "desc" }, take: 500 })
      ]);
      const firstSeenByVisitor = new Map<string, string>();
      for (const row of recentRows.slice().reverse()) {
        if (!firstSeenByVisitor.has(row.visitorId)) firstSeenByVisitor.set(row.visitorId, row.createdAt.toISOString());
      }
      const activeMap = new Map<string, VisitorActivity>();
      for (const row of activeRows) {
        if (!activeMap.has(row.visitorId)) {
          activeMap.set(row.visitorId, {
            userId: row.userId,
            visitorId: row.visitorId,
            path: row.path,
            userAgent: row.userAgent,
            email: row.email,
            name: row.name,
            role: row.role,
            firstSeen: firstSeenByVisitor.get(row.visitorId) || row.createdAt.toISOString(),
            lastSeen: row.createdAt.toISOString()
          });
        }
      }
      const recent = recentRows.map((row) => ({
        userId: row.userId,
        visitorId: row.visitorId,
        path: row.path,
        userAgent: row.userAgent,
        email: row.email,
        name: row.name,
        role: row.role,
        firstSeen: firstSeenByVisitor.get(row.visitorId) || row.createdAt.toISOString(),
        lastSeen: row.createdAt.toISOString()
      }));
      return {
        active: Array.from(activeMap.values()),
        recent,
        activeCount: activeMap.size
      };
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("[activity] database activity read failed", error);
      }
    }
  }

  const activity = await readActivity();
  const now = Date.now();
  const active = activity.filter((item) => now - new Date(item.lastSeen).getTime() <= ACTIVE_WINDOW_MS);
  return {
    active,
    recent: activity.slice(0, 30),
    activeCount: active.length
  };
}
