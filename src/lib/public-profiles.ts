import { prisma } from "@/lib/prisma";
import { getProducts } from "@/lib/products";
import { canUseDatabase } from "@/lib/db-availability";

export type PublicProfile = {
  username: string;
  name: string;
  role: string;
  bio: string;
  location: string;
  image?: string | null;
  bannerImage?: string | null;
  instagram?: string | null;
  youtube?: string | null;
  spotify?: string | null;
  tiktok?: string | null;
  website?: string | null;
  verified?: boolean;
  stats: { products: number; followers: number; reviews: number };
};

export async function getPublicProfile(username: string): Promise<PublicProfile | null> {
  if (!(await canUseDatabase())) return getFallbackProfile(username);

  try {
    const user = await prisma.user.findFirst({
      where: { OR: [{ username }, { id: username }, { email: username }] },
      include: {
        producerProfile: true,
        engineerProfile: true,
        studioProfile: true,
        artistProfile: true,
        products: { where: { active: true } },
        followers: true,
        reviewsReceived: true
      }
    });
    if (!user) return null;
    const producer = user.producerProfile;
    const engineer = user.engineerProfile;
    const studio = user.studioProfile;
    const artist = user.artistProfile;
    return {
      username: user.username || user.id,
      name: producer?.artistName || engineer?.displayName || studio?.studioName || artist?.artistName || user.name || "Ellbopa User",
      role: user.role,
      bio: producer?.bio || engineer?.bio || studio?.bio || artist?.bio || "Perfil musical en Ellbopa Music.",
      location: producer?.location || engineer?.location || studio?.location || artist?.location || "Santo Domingo, RD",
      image: producer?.profileImage || engineer?.profileImage || artist?.profileImage || user.image,
      bannerImage: producer?.bannerImage || engineer?.bannerImage || studio?.photos || null,
      instagram: producer?.instagram || artist?.instagram,
      youtube: producer?.youtube || artist?.youtube,
      spotify: producer?.spotify || artist?.spotify,
      tiktok: producer?.tiktok,
      website: producer?.website,
      verified: producer?.verified || false,
      stats: { products: user.products.length, followers: user.followers.length, reviews: user.reviewsReceived.length }
    };
  } catch {
    return getFallbackProfile(username);
  }
}

async function getFallbackProfile(username: string) {
  const products = await getProducts();
  if (username !== "ellbopa" && username !== "ellbopamusic") return null;
  return {
    username: "ellbopa",
    name: "Ellbopa Music",
    role: "ADMIN",
    bio: "Estudio, productores e ingenieros urbanos en Santo Domingo.",
    location: "Invivienda / Los Mina, Santo Domingo",
    image: "/images/ellbopa-logo.jpeg",
    bannerImage: "/images/beat-cover.svg",
    instagram: "https://instagram.com/ellbopamusic",
    verified: true,
    stats: { products: products.length, followers: 0, reviews: 0 }
  };
}
