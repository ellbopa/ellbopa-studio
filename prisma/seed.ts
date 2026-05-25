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
      title: "Dembow RGB Drum Kit",
      type: ProductType.SOUND_KIT,
      genre: "Dembow",
      price: 2500,
      imageUrl: "/images/preset-cover.svg",
      fileUrl: "/downloads/dembow-rgb-drum-kit.zip",
      description: "Pack de drums, one shots y loops para producir dembow moderno."
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
    const saved = await prisma.product.upsert({
      where: { id: product.title.toLowerCase().replaceAll(" ", "-") },
      update: { ...product, slug: product.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") },
      create: {
        id: product.title.toLowerCase().replaceAll(" ", "-"),
        slug: product.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        ...product
      }
    });

    if (product.type === ProductType.BEAT) {
      const licenseSeed = [
        { key: "basic", title: "Basic License", price: product.price, files: "MP3", terms: "Distribucion hasta 10,000 copias; Streaming hasta 50,000 reproducciones" },
        { key: "premium", title: "Premium License", price: Math.round(product.price * 1.6), files: "WAV, MP3", terms: "Distribucion hasta 100,000 copias; Streaming hasta 500,000 reproducciones" },
        { key: "unlimited", title: "Unlimited License", price: Math.round(product.price * 3), files: "WAV, STEMS, MP3", terms: "Streams ilimitados; trackouts incluidos; uso comercial amplio" }
      ];
      for (const license of licenseSeed) {
        await prisma.license.upsert({
          where: { productId_key: { productId: saved.id, key: license.key } },
          update: license,
          create: { ...license, productId: saved.id }
        });
      }
    }
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
