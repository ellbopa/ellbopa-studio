import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { defaultSiteConfig, saveSiteConfig, textareaToList } from "@/lib/site-config";
import { isConfiguredAdminEmail } from "@/lib/config";

export async function POST(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN" && !isConfiguredAdminEmail(session?.user?.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();

  await saveSiteConfig({
    ...defaultSiteConfig,
    brandName: String(formData.get("brandName") ?? defaultSiteConfig.brandName),
    location: String(formData.get("location") ?? defaultSiteConfig.location),
    heroTitle: String(formData.get("heroTitle") ?? defaultSiteConfig.heroTitle),
    heroSubtitle: String(formData.get("heroSubtitle") ?? defaultSiteConfig.heroSubtitle),
    heroBadge: String(formData.get("heroBadge") ?? defaultSiteConfig.heroBadge),
    ctaPrimary: String(formData.get("ctaPrimary") ?? defaultSiteConfig.ctaPrimary),
    ctaSecondary: String(formData.get("ctaSecondary") ?? defaultSiteConfig.ctaSecondary),
    ctaUpload: String(formData.get("ctaUpload") ?? defaultSiteConfig.ctaUpload),
    whatsapp: String(formData.get("whatsapp") ?? defaultSiteConfig.whatsapp).replace(/\D/g, ""),
    bankAccount: String(formData.get("bankAccount") ?? defaultSiteConfig.bankAccount),
    bankOwner: String(formData.get("bankOwner") ?? defaultSiteConfig.bankOwner),
    footerText: String(formData.get("footerText") ?? defaultSiteConfig.footerText),
    instagram: String(formData.get("instagram") ?? defaultSiteConfig.instagram),
    primaryColor: String(formData.get("primaryColor") ?? defaultSiteConfig.primaryColor),
    goldColor: String(formData.get("goldColor") ?? defaultSiteConfig.goldColor),
    artistLogos: textareaToList(String(formData.get("artistLogos") ?? "")),
    testimonials: textareaToList(String(formData.get("testimonials") ?? ""))
  });

  return NextResponse.redirect(new URL("/admin?saved=site", request.url));
}
