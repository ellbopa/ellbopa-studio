import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/products";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const routes = ["", "/marketplace", "/beats", "/presets", "/sound-kits", "/servicios", "/reservas", "/mezcla-online", "/comunidad", "/contacto", "/login", "/registro", "/u/ellbopa"];
  const products = await getProducts();

  return [
    ...routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" as const : "weekly" as const,
    priority: route === "" ? 1 : 0.8
    })),
    ...products.map((product) => ({
      url: `${siteUrl}/producto/${encodeURIComponent(getSlug(product))}`,
      lastModified: new Date(product.createdAt),
      changeFrequency: "weekly" as const,
      priority: 0.72
    }))
  ];
}

function getSlug(product: { id: string; slug?: string | null }) {
  return product.slug || product.id;
}
