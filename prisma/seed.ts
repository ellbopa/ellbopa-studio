import { PrismaClient, ProductType, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("admin12345", 10);
  const clientPassword = await bcrypt.hash("cliente12345", 10);

  await prisma.user.upsert({
    where: { email: "admin@ellbopastudio.com" },
    update: {},
    create: {
      name: "Adonis Castillo",
      email: "admin@ellbopastudio.com",
      phone: "+1 809-590-3643",
      role: Role.ADMIN,
      onboardingCompleted: true,
      passwordHash: adminPassword,
      verified: true,
      emailVerified: new Date()
    }
  });

  await prisma.user.upsert({
    where: { email: "cliente@demo.com" },
    update: {},
    create: {
      name: "Cliente Demo",
      email: "cliente@demo.com",
      phone: "+1 809-000-0000",
      role: Role.ARTIST,
      onboardingCompleted: true,
      passwordHash: clientPassword,
      verified: true,
      emailVerified: new Date()
    }
  });

  const products = [
    {
      title: "Detroit Dembow Bounce",
      type: ProductType.BEAT,
      genre: "Dembow",
      bpm: 102,
      musicalKey: "Fm",
      mood: "Calle premium",
      price: 3500,
      audioUrl: "/audio/demo-beat.mp3",
      imageUrl: "/images/beat-cover.svg",
      fileUrl: "/downloads/detroit-dembow.zip",
      description: "Beat con bajo agresivo, percusion seca y espacio para melodias pegajosas."
    },
    {
      title: "R&B Noche Roja",
      type: ProductType.BEAT,
      genre: "R&B",
      bpm: 78,
      musicalKey: "C#m",
      mood: "Oscuro",
      price: 4200,
      audioUrl: "/audio/demo-beat.mp3",
      imageUrl: "/images/beat-cover.svg",
      fileUrl: "/downloads/rnb-noche-roja.zip",
      description: "Instrumental suave, moderno y caro para voces melodicas."
    },
    {
      title: "Trap Vocal Chain",
      type: ProductType.PRESET,
      genre: "Trap",
      price: 1800,
      imageUrl: "/images/preset-cover.svg",
      fileUrl: "/downloads/trap-vocal-chain.zip",
      description: "Chain vocal lista para grabar con brillo, presencia y tuning controlado."
    },
    {
      title: "Mezcla y Master Online",
      type: ProductType.SERVICE,
      genre: "Trap, R&B, Detroit, Dembow",
      price: 5000,
      imageUrl: "/images/service-cover.svg",
      description: "Mezcla completa, master competitivo y revision incluida."
    },
    {
      title: "Produccion Personalizada Completa",
      type: ProductType.SERVICE,
      genre: "Urbano",
      price: 10000,
      imageUrl: "/images/service-cover.svg",
      description: "Beat personalizado, grabacion, edicion vocal, mezcla y master."
    }
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.title.toLowerCase().replaceAll(" ", "-") },
      update: product,
      create: {
        id: product.title.toLowerCase().replaceAll(" ", "-"),
        ...product
      }
    });
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
