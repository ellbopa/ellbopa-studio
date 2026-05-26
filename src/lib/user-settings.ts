import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { normalizeRole } from "@/lib/roles";

export const reservedUsernames = new Set(["admin", "support", "ellbopa", "api", "login", "register", "registro", "settings", "dashboard"]);

export const usernameSchema = z.string()
  .trim()
  .toLowerCase()
  .min(3)
  .max(30)
  .regex(/^[a-z0-9_][a-z0-9_-]*[a-z0-9_]$/);

export const profileSettingsSchema = z.object({
  name: z.string().trim().max(120).optional(),
  username: usernameSchema.optional(),
  artistName: z.string().trim().max(120).optional(),
  bio: z.string().trim().max(1200).optional(),
  location: z.string().trim().max(120).optional(),
  country: z.string().trim().max(80).optional(),
  instagram: z.string().trim().max(240).optional(),
  tiktok: z.string().trim().max(240).optional(),
  youtube: z.string().trim().max(240).optional(),
  spotify: z.string().trim().max(240).optional(),
  beatstars: z.string().trim().max(240).optional(),
  website: z.string().trim().max(240).optional(),
  genres: z.string().trim().max(240).optional(),
  specialty: z.string().trim().max(80).optional(),
  startingPrice: z.coerce.number().int().min(0).optional(),
  availability: z.string().trim().max(120).optional(),
  contactLinks: z.string().trim().max(600).optional(),
  emailVisible: z.coerce.boolean().optional(),
  payoutPaypal: z.string().trim().max(160).optional(),
  notificationPrefs: z.string().trim().max(600).optional(),
  image: z.string().trim().max(600).optional(),
  bannerImage: z.string().trim().max(600).optional()
});

export async function ensureUsernameAvailable(username: string, userId: string) {
  if (reservedUsernames.has(username)) return false;
  const existing = await prisma.user.findUnique({ where: { username }, select: { id: true } });
  return !existing || existing.id === userId;
}

export async function updateUserProfile(userId: string, input: z.infer<typeof profileSettingsSchema>) {
  const role = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  const normalizedRole = normalizeRole(role?.role);
  const displayName = input.artistName || input.name || undefined;

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      name: input.name,
      username: input.username,
      image: input.image,
      bannerImage: input.bannerImage,
      country: input.country,
      specialty: input.specialty,
      availability: input.availability,
      beatstars: input.beatstars,
      website: input.website,
      contactLinks: input.contactLinks,
      emailVisible: input.emailVisible,
      payoutPaypal: input.payoutPaypal,
      notificationPrefs: input.notificationPrefs
    }
  });

  if (normalizedRole === "PRODUCER" || normalizedRole === "ADMIN") {
    await prisma.producerProfile.upsert({
      where: { userId },
      create: {
        userId,
        displayName,
        artistName: displayName,
        bio: input.bio,
        location: input.location,
        genres: input.genres,
        profileImage: input.image,
        bannerImage: input.bannerImage,
        instagram: input.instagram,
        youtube: input.youtube,
        tiktok: input.tiktok,
        spotify: input.spotify,
        website: input.website,
        startingPrice: input.startingPrice
      },
      update: {
        displayName,
        artistName: displayName,
        bio: input.bio,
        location: input.location,
        genres: input.genres,
        profileImage: input.image,
        bannerImage: input.bannerImage,
        instagram: input.instagram,
        youtube: input.youtube,
        tiktok: input.tiktok,
        spotify: input.spotify,
        website: input.website,
        startingPrice: input.startingPrice
      }
    });
  } else if (normalizedRole === "ENGINEER") {
    await prisma.engineerProfile.upsert({
      where: { userId },
      create: { userId, displayName, bio: input.bio, location: input.location, specialties: input.specialty || input.genres, profileImage: input.image, bannerImage: input.bannerImage, startingPrice: input.startingPrice },
      update: { displayName, bio: input.bio, location: input.location, specialties: input.specialty || input.genres, profileImage: input.image, bannerImage: input.bannerImage, startingPrice: input.startingPrice }
    });
  } else if (normalizedRole === "STUDIO") {
    await prisma.studioProfile.upsert({
      where: { userId },
      create: { userId, studioName: displayName, bio: input.bio, location: input.location, photos: input.bannerImage, services: input.genres },
      update: { studioName: displayName, bio: input.bio, location: input.location, photos: input.bannerImage, services: input.genres }
    });
  } else {
    await prisma.artistProfile.upsert({
      where: { userId },
      create: { userId, artistName: displayName, bio: input.bio, location: input.location, genres: input.genres, instagram: input.instagram, spotify: input.spotify, youtube: input.youtube, profileImage: input.image },
      update: { artistName: displayName, bio: input.bio, location: input.location, genres: input.genres, instagram: input.instagram, spotify: input.spotify, youtube: input.youtube, profileImage: input.image }
    });
  }

  return user;
}
