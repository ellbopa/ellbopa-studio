import { unstable_noStore as noStore } from "next/cache";
import { promises as fs } from "node:fs";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { canUseDatabase } from "@/lib/db-availability";

type LocalFavorite = { userId: string; productId: string; createdAt: string };
const favoritesPath = path.join(process.cwd(), "data", "favorites.json");

async function readLocalFavorites() {
  noStore();
  try {
    const raw = await fs.readFile(favoritesPath, "utf8");
    return JSON.parse(raw) as LocalFavorite[];
  } catch {
    return [];
  }
}

export async function getFavoriteIds(userId?: string | null) {
  if (!userId) return new Set<string>();
  if (!(await canUseDatabase())) {
    const favorites = await readLocalFavorites();
    return new Set(favorites.filter((favorite) => favorite.userId === userId).map((favorite) => favorite.productId));
  }
  try {
    const favorites = await prisma.favorite.findMany({ where: { userId }, select: { productId: true } });
    return new Set(favorites.map((favorite) => favorite.productId));
  } catch {
    const favorites = await readLocalFavorites();
    return new Set(favorites.filter((favorite) => favorite.userId === userId).map((favorite) => favorite.productId));
  }
}

export async function toggleFavorite(userId: string, productId: string) {
  if (!(await canUseDatabase())) {
    const current = await readLocalFavorites();
    const exists = current.some((favorite) => favorite.userId === userId && favorite.productId === productId);
    const next = exists
      ? current.filter((favorite) => !(favorite.userId === userId && favorite.productId === productId))
      : [{ userId, productId, createdAt: new Date().toISOString() }, ...current];
    await fs.mkdir(path.dirname(favoritesPath), { recursive: true });
    await fs.writeFile(favoritesPath, JSON.stringify(next, null, 2), "utf8");
    return !exists;
  }

  try {
    const existing = await prisma.favorite.findUnique({ where: { userId_productId: { userId, productId } } });
    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      return false;
    }
    await prisma.favorite.create({ data: { userId, productId } });
    return true;
  } catch {
    const current = await readLocalFavorites();
    const exists = current.some((favorite) => favorite.userId === userId && favorite.productId === productId);
    const next = exists
      ? current.filter((favorite) => !(favorite.userId === userId && favorite.productId === productId))
      : [{ userId, productId, createdAt: new Date().toISOString() }, ...current];
    await fs.mkdir(path.dirname(favoritesPath), { recursive: true });
    await fs.writeFile(favoritesPath, JSON.stringify(next, null, 2), "utf8");
    return !exists;
  }
}
