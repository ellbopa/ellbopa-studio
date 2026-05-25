import { ProductType } from "@prisma/client";
import { getLicenseOptions } from "@/lib/licensing";
import { getProducts } from "@/lib/products";
import { prisma } from "@/lib/prisma";

export type CatalogProductSnapshot = {
  id: string;
  title: string;
  type: string;
  genre?: string | null;
  bpm?: number | null;
  musicalKey?: string | null;
  mood?: string | null;
  description?: string | null;
  price: number;
  premiumPrice?: number | null;
  exclusivePrice?: number | null;
  imageUrl?: string | null;
  audioUrl?: string | null;
  fileUrl?: string | null;
  active?: boolean | null;
};

export async function ensurePrismaProduct(productId: string, snapshot?: CatalogProductSnapshot | null, ownerId?: string | null) {
  const existing = await prisma.product.findUnique({ where: { id: productId } });
  if (existing) return existing;

  const source = (snapshot ?? (await getProducts()).find((product) => product.id === productId)) as CatalogProductSnapshot | undefined;
  if (!source) return null;

  const product = await prisma.product.upsert({
    where: { id: source.id },
    update: {
      title: source.title,
      type: source.type as ProductType,
      genre: source.genre ?? "",
      bpm: source.bpm ?? null,
      musicalKey: source.musicalKey ?? "",
      mood: source.mood ?? "",
      description: source.description || "Producto digital Ellbopa Music.",
      price: Number(source.price || 0),
      premiumPrice: source.premiumPrice ?? null,
      exclusivePrice: source.exclusivePrice ?? null,
      imageUrl: source.imageUrl ?? null,
      audioUrl: source.audioUrl ?? null,
      fileUrl: source.fileUrl ?? null,
      active: source.active ?? true
    },
    create: {
      id: source.id,
      slug: source.id,
      ownerId: ownerId ?? undefined,
      title: source.title,
      type: source.type as ProductType,
      genre: source.genre ?? "",
      bpm: source.bpm ?? null,
      musicalKey: source.musicalKey ?? "",
      mood: source.mood ?? "",
      description: source.description || "Producto digital Ellbopa Music.",
      price: Number(source.price || 0),
      premiumPrice: source.premiumPrice ?? null,
      exclusivePrice: source.exclusivePrice ?? null,
      imageUrl: source.imageUrl ?? null,
      audioUrl: source.audioUrl ?? null,
      fileUrl: source.fileUrl ?? null,
      active: source.active ?? true
    }
  });

  if (product.type === ProductType.BEAT) {
    await prisma.license.createMany({
      data: getLicenseOptions(product).map((license) => ({
        productId: product.id,
        key: license.key,
        title: license.title,
        price: license.price,
        files: license.files,
        terms: license.terms.join("; ")
      })),
      skipDuplicates: true
    });
  }

  if (process.env.NODE_ENV === "development") {
    console.error("[catalog-sync][product-created]", {
      productId: product.id,
      type: product.type,
      hasFile: Boolean(product.fileUrl)
    });
  }

  return product;
}
