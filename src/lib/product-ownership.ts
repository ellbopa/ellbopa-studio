import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAdminUser } from "@/lib/admin";
import { normalizeMusicalKey } from "@/lib/music-keys";

export const productUpdateSchema = z.object({
  title: z.string().trim().min(2).max(120).optional(),
  type: z.enum(["BEAT", "PRESET", "SOUND_KIT", "SERVICE"]).optional(),
  genre: z.string().trim().max(80).optional(),
  bpm: z.coerce.number().int().min(0).max(300).nullable().optional(),
  musicalKey: z.string().trim().max(80).optional(),
  mood: z.string().trim().max(80).optional(),
  description: z.string().trim().min(8).max(1200).optional(),
  price: z.coerce.number().int().min(0).optional(),
  premiumPrice: z.coerce.number().int().min(0).nullable().optional(),
  exclusivePrice: z.coerce.number().int().min(0).nullable().optional(),
  imageUrl: z.string().trim().max(600).optional(),
  audioUrl: z.string().trim().max(600).optional(),
  fileUrl: z.string().trim().max(600).optional(),
  active: z.boolean().optional()
});

export async function assertProductOwner(productId: string, user: { id?: string | null; email?: string | null; role?: string | null }) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, ownerId: true }
  });
  if (!product) return { ok: false as const, status: 404, error: "Producto no encontrado" };
  if (!isAdminUser(user) && product.ownerId !== user.id) return { ok: false as const, status: 403, error: "No puedes modificar productos de otro usuario" };
  return { ok: true as const, product };
}

export function normalizeProductUpdate(data: z.infer<typeof productUpdateSchema>) {
  return {
    ...data,
    musicalKey: data.musicalKey === undefined ? undefined : normalizeMusicalKey(data.musicalKey),
    bpm: data.bpm === 0 ? null : data.bpm,
    premiumPrice: data.premiumPrice === 0 ? null : data.premiumPrice,
    exclusivePrice: data.exclusivePrice === 0 ? null : data.exclusivePrice
  };
}
