import { NextResponse } from "next/server";
import { ProductType } from "@prisma/client";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { saveLocalProduct } from "@/lib/local-products";
import { isConfiguredAdminEmail } from "@/lib/config";
import { canUploadProducts } from "@/lib/roles";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";
import { getLicenseOptions } from "@/lib/licensing";

const uploadSchema = z.object({
  type: z.enum(["BEAT", "PRESET", "SOUND_KIT"]),
  title: z.string().trim().min(2).max(120),
  genre: z.string().trim().max(80).optional(),
  bpm: z.coerce.number().int().min(0).max(300).optional(),
  musicalKey: z.string().trim().max(20).optional(),
  mood: z.string().trim().max(80).optional(),
  description: z.string().trim().min(8).max(1200),
  price: z.coerce.number().int().min(0),
  premiumPrice: z.coerce.number().int().min(0).optional(),
  exclusivePrice: z.coerce.number().int().min(0).optional(),
  imageUrl: z.string().trim().max(600).optional(),
  audioUrl: z.string().trim().max(600).optional(),
  fileUrl: z.string().trim().max(600).optional(),
  imageName: z.string().trim().max(200).optional(),
  audioName: z.string().trim().max(200).optional(),
  fileName: z.string().trim().max(200).optional(),
  returnTo: z.enum(["producer", "engineer", "admin"]).optional()
});

export async function POST(request: Request) {
  if (isRateLimited(`upload:${getClientIp(request)}`, 20, 60_000)) {
    return NextResponse.json({ error: "Too many uploads" }, { status: 429 });
  }

  const session = await auth();
  if (!canUploadProducts(session?.user?.role) && !isConfiguredAdminEmail(session?.user?.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const parsed = uploadSchema.safeParse({
    type: String(formData.get("type") ?? "BEAT"),
    title: String(formData.get("title") ?? ""),
    genre: String(formData.get("genre") ?? ""),
    bpm: String(formData.get("bpm") ?? "0"),
    musicalKey: String(formData.get("musicalKey") ?? ""),
    mood: String(formData.get("mood") ?? ""),
    description: String(formData.get("description") ?? ""),
    price: String(formData.get("price") ?? "0"),
    premiumPrice: String(formData.get("premiumPrice") ?? "0"),
    exclusivePrice: String(formData.get("exclusivePrice") ?? "0"),
    imageUrl: String(formData.get("imageUrl") ?? ""),
    audioUrl: String(formData.get("audioUrl") ?? ""),
    fileUrl: String(formData.get("fileUrl") ?? ""),
    imageName: String(formData.get("imageName") ?? ""),
    audioName: String(formData.get("audioName") ?? ""),
    fileName: String(formData.get("fileName") ?? ""),
    returnTo: String(formData.get("returnTo") ?? "producer")
  });
  if (!parsed.success) return NextResponse.redirect(new URL("/dashboard/producer/upload?error=validation", request.url));

  const validationError = validateUploadedAssets(parsed.data);
  if (validationError) return NextResponse.redirect(new URL(`/dashboard/producer/upload?error=${validationError}`, request.url));

  const { title, type } = parsed.data;
  const id = `${slugify(title)}-${Date.now()}`;
  const imageUrl = parsed.data.imageUrl || defaultCoverFor(type);
  const audioUrl = parsed.data.audioUrl || null;
  const fileUrl = parsed.data.fileUrl || null;

  const productPayload = {
    id,
    title,
    type: type as ProductType,
    genre: parsed.data.genre ?? "",
    bpm: parsed.data.bpm || null,
    musicalKey: parsed.data.musicalKey ?? "",
    mood: parsed.data.mood ?? "",
    description: parsed.data.description,
    price: parsed.data.price,
    premiumPrice: parsed.data.premiumPrice || null,
    exclusivePrice: parsed.data.exclusivePrice || null,
    imageUrl,
    audioUrl,
    fileUrl,
    active: true,
    createdAt: new Date().toISOString()
  };

  try {
    const product = await prisma.product.create({
      data: {
        id,
        slug: id,
        ownerId: session?.user?.id,
        title,
        type: type as ProductType,
        genre: parsed.data.genre ?? "",
        bpm: parsed.data.bpm || null,
        musicalKey: parsed.data.musicalKey ?? "",
        mood: parsed.data.mood ?? "",
        description: parsed.data.description,
        price: parsed.data.price,
        premiumPrice: parsed.data.premiumPrice || null,
        exclusivePrice: parsed.data.exclusivePrice || null,
        imageUrl,
        audioUrl,
        fileUrl,
        active: true
      }
    });

    if (process.env.NODE_ENV === "development") {
      console.error("[upload-product][created]", {
        productId: product.id,
        ownerId: product.ownerId,
        hasCover: Boolean(product.imageUrl),
        hasPreview: Boolean(product.audioUrl),
        hasFinalFile: Boolean(product.fileUrl)
      });
    }

    if (type === "BEAT") {
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
  } catch (error) {
    console.error("[upload-product][db]", error);
    await saveLocalProduct(productPayload);
  }

  const redirectTo = getRedirectPath(parsed.data.returnTo, session?.user?.role);
  return NextResponse.redirect(new URL(redirectTo, request.url));
}

function validateUploadedAssets(data: z.infer<typeof uploadSchema>) {
  if (!data.fileUrl) return "missing-file";
  if (data.imageUrl && !isAllowedAsset(data.imageUrl, data.imageName, ["jpg", "jpeg", "png", "webp"])) return "invalid-cover";
  if (data.audioUrl && !isAllowedAsset(data.audioUrl, data.audioName, ["mp3", "wav"])) return "invalid-preview";
  if (data.fileUrl && !isAllowedAsset(data.fileUrl, data.fileName, ["mp3", "wav", "zip"])) return "invalid-file";
  return "";
}

function isAllowedAsset(url: string, name: string | undefined, extensions: string[]) {
  if (!/^https?:\/\//i.test(url) && !url.startsWith("/")) return false;
  const target = (name || url).split("?")[0].toLowerCase();
  return extensions.some((extension) => target.endsWith(`.${extension}`)) || /^https:\/\/(?:[^/]+\.)?(?:ufs\.sh|utfs\.io)\//i.test(url);
}

function slugify(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "producto";
}

function defaultCoverFor(type: string) {
  return type === "PRESET" || type === "SOUND_KIT" ? "/images/preset-cover.svg" : "/images/beat-cover.svg";
}

function getRedirectPath(returnTo: string | undefined, role?: string | null) {
  if (returnTo === "admin" || role === "ADMIN") return "/admin?uploaded=1";
  if (returnTo === "engineer" || role === "ENGINEER") return "/dashboard/engineer?uploaded=1";
  return "/dashboard/producer?uploaded=1";
}
