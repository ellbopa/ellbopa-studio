import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function completeRoleOnboarding(
  userId: string,
  role: Exclude<Role, "ADMIN">,
  name?: string | null,
  profile?: { displayName?: string; bio?: string; location?: string; genres?: string; instagram?: string; startingPrice?: number }
) {
  const displayName = name || "Ellbopa User";
  const publicName = profile?.displayName || displayName;
  const location = profile?.location || "Santo Domingo, RD";
  const genres = profile?.genres || "Trap, R&B, Dembow";

  await prisma.user.update({
    where: { id: userId },
    data: {
      role,
      onboardingCompleted: true,
      username: `${publicName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${userId.slice(-4)}`
    }
  });

  if (role === "ARTIST") {
    await prisma.artistProfile.upsert({
      where: { userId },
      create: { userId, artistName: publicName, bio: profile?.bio, location, genres, instagram: profile?.instagram },
      update: { artistName: publicName, bio: profile?.bio, location, genres, instagram: profile?.instagram }
    });
  }

  if (role === "PRODUCER") {
    await prisma.producerProfile.upsert({
      where: { userId },
      create: { userId, displayName: publicName, artistName: publicName, bio: profile?.bio, location, genres, instagram: profile?.instagram, startingPrice: profile?.startingPrice || 3500 },
      update: { displayName: publicName, artistName: publicName, bio: profile?.bio, location, genres, instagram: profile?.instagram, startingPrice: profile?.startingPrice || 3500 }
    });
  }

  if (role === "ENGINEER") {
    await prisma.engineerProfile.upsert({
      where: { userId },
      create: { userId, displayName: publicName, bio: profile?.bio, location, specialties: genres || "Mezcla, mastering, vocal tuning", startingPrice: profile?.startingPrice || 5000, deliveryTime: "3-5 dias", revisions: 2 },
      update: { displayName: publicName, bio: profile?.bio, location, specialties: genres, startingPrice: profile?.startingPrice || 5000 }
    });
  }

  if (role === "STUDIO") {
    await prisma.studioProfile.upsert({
      where: { userId },
      create: { userId, studioName: displayName, location: "Santo Domingo, RD", hourlyRate: 2500, depositRequired: 50, services: "Grabacion, mezcla, mastering" },
      update: {}
    });
  }
}
