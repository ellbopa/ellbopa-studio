import { unstable_noStore as noStore } from "next/cache";
import { promises as fs } from "node:fs";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { canUseDatabase } from "@/lib/db-availability";

export type SiteConfig = {
  brandName: string;
  location: string;
  heroTitle: string;
  heroSubtitle: string;
  heroBadge: string;
  ctaPrimary: string;
  ctaSecondary: string;
  ctaUpload: string;
  whatsapp: string;
  bankAccount: string;
  bankOwner: string;
  footerText: string;
  instagram: string;
  primaryColor: string;
  goldColor: string;
  artistLogos: string[];
  testimonials: string[];
};

export const defaultSiteConfig: SiteConfig = {
  brandName: "Ellbopa Music",
  location: "Santo Domingo RD - Invivienda / Los Mina",
  heroTitle: "Graba, mezcla y lanza tu proximo hit en Ellbopa Music",
  heroSubtitle:
    "Sonido urbano moderno para trap, R&B, Detroit y dembow. Produccion, grabacion, mezcla, mastering, beats, presets y servicios online con vibra premium dominicana.",
  heroBadge: "Studio Preview",
  ctaPrimary: "Reservar por WhatsApp",
  ctaSecondary: "Comprar beats",
  ctaUpload: "Subir cancion para mezclar",
  whatsapp: "18095903643",
  bankAccount: "Banreservas 9606575461",
  bankOwner: "Adonis Castillo",
  footerText: "Estudio urbano premium en Santo Domingo, RD. Grabacion, mezcla, mastering, beats, presets y servicios online.",
  instagram: "@ellbopastudio",
  primaryColor: "#e50914",
  goldColor: "#d9a441",
  artistLogos: ["TRAP", "R&B", "DETROIT", "DEMBOW", "VOCAL CHAIN", "MASTER"],
  testimonials: [
    "La mezcla quedo dura y clara, lista pa Spotify.",
    "Ellbopa me guio la grabacion y saco el color de la voz.",
    "El beat personalizado llego con el swing exacto."
  ]
};

const configPath = path.join(process.cwd(), "data", "site-config.json");
const SITE_CONFIG_KEY = "site-config";

export async function getSiteConfig(): Promise<SiteConfig> {
  noStore();
  if (await canUseDatabase()) {
    try {
      const row = await prisma.siteSetting.findUnique({ where: { key: SITE_CONFIG_KEY } });
      if (row?.value) return { ...defaultSiteConfig, ...JSON.parse(row.value) };
    } catch (error) {
      if (process.env.NODE_ENV !== "production") console.error("[site-config] database read failed", error);
    }
  }
  try {
    const raw = await fs.readFile(configPath, "utf8");
    return { ...defaultSiteConfig, ...JSON.parse(raw) };
  } catch {
    return defaultSiteConfig;
  }
}

export async function saveSiteConfig(config: SiteConfig) {
  if (await canUseDatabase()) {
    await prisma.siteSetting.upsert({
      where: { key: SITE_CONFIG_KEY },
      create: { key: SITE_CONFIG_KEY, value: JSON.stringify(config) },
      update: { value: JSON.stringify(config) }
    });
    return;
  }
  if (process.env.NODE_ENV === "production") return;
  await fs.mkdir(path.dirname(configPath), { recursive: true });
  await fs.writeFile(configPath, JSON.stringify(config, null, 2), "utf8");
}

export function listToTextarea(items: string[]) {
  return items.join("\n");
}

export function textareaToList(value: string) {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}
