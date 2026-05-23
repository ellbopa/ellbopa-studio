import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function completeRoleOnboarding(userId: string, role: Exclude<Role, "ADMIN">, name?: string | null) {
  const displayName = name || "Ellbopa User";

  await prisma.user.update({
    where: { id: userId },
    data: { role, onboardingCompleted: true }
  });

  if (role === "ARTIST") {
    await prisma.artistProfile.upsert({
      where: { userId },
      create: { userId, artistName: displayName, location: "Santo Domingo, RD" },
      update: {}
    });
  }

  if (role === "PRODUCER") {
    await prisma.producerProfile.upsert({
      where: { userId },
      create: { userId, displayName, artistName: displayName, location: "Santo Domingo, RD", genres: "Trap, R&B, Dembow", startingPrice: 3500 },
      update: {}
    });
  }

  if (role === "ENGINEER") {
    await prisma.engineerProfile.upsert({
      where: { userId },
      create: { userId, displayName, location: "Santo Domingo, RD", specialties: "Mezcla, mastering, vocal tuning", startingPrice: 5000, deliveryTime: "3-5 dias", revisions: 2 },
      update: {}
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
