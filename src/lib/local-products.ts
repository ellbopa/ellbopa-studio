import { ProductType } from "@prisma/client";
import { unstable_noStore as noStore } from "next/cache";
import { promises as fs } from "node:fs";
import path from "node:path";

export type LocalProduct = {
  id: string;
  title: string;
  type: ProductType;
  genre?: string | null;
  bpm?: number | null;
  musicalKey?: string | null;
  mood?: string | null;
  description: string;
  price: number;
  premiumPrice?: number | null;
  exclusivePrice?: number | null;
  audioUrl?: string | null;
  imageUrl?: string | null;
  fileUrl?: string | null;
  active: boolean;
  createdAt: string;
};

const productsPath = path.join(process.cwd(), "data", "products.json");

export async function getLocalProducts(type?: ProductType) {
  noStore();
  try {
    const raw = await fs.readFile(productsPath, "utf8");
    const products = JSON.parse(raw) as LocalProduct[];
    return products.filter((product) => product.active && (!type || product.type === type));
  } catch {
    return [];
  }
}

export async function saveLocalProduct(product: LocalProduct) {
  await fs.mkdir(path.dirname(productsPath), { recursive: true });
  const products = await getLocalProducts();
  const next = [product, ...products.filter((item) => item.id !== product.id)];
  await fs.writeFile(productsPath, JSON.stringify(next, null, 2), "utf8");
}

export async function saveUpload(file: File | null, folder: string) {
  if (!file || file.size === 0) return "";
  const bytes = Buffer.from(await file.arrayBuffer());
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const filename = `${Date.now()}-${safeName}`;
  const dir = path.join(process.cwd(), "public", "uploads", folder);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, filename), bytes);
  return `/uploads/${folder}/${filename}`;
}
