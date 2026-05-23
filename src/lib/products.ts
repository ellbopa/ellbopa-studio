import { ProductType } from "@prisma/client";
import net from "node:net";
import { prisma } from "@/lib/prisma";
import { getLocalProducts } from "@/lib/local-products";

export const fallbackProducts = [
  {
    id: "detroit-dembow-bounce",
    title: "Detroit Dembow Bounce",
    type: ProductType.BEAT,
    genre: "Dembow",
    bpm: 102,
    musicalKey: "Fm",
    mood: "Calle premium",
    description: "Beat con bajo agresivo, percusion seca y espacio para melodias pegajosas.",
    price: 3500,
    audioUrl: "/audio/demo-beat.mp3",
    imageUrl: "/images/beat-cover.svg",
    fileUrl: "/downloads/detroit-dembow.zip",
    active: true,
    createdAt: new Date()
  },
  {
    id: "rnb-noche-roja",
    title: "R&B Noche Roja",
    type: ProductType.BEAT,
    genre: "R&B",
    bpm: 78,
    musicalKey: "C#m",
    mood: "Oscuro",
    description: "Instrumental suave, moderno y caro para voces melodicas.",
    price: 4200,
    audioUrl: "/audio/demo-beat.mp3",
    imageUrl: "/images/beat-cover.svg",
    fileUrl: "/downloads/rnb-noche-roja.zip",
    active: true,
    createdAt: new Date()
  },
  {
    id: "call-me-up-trap",
    title: "Call Me Up",
    type: ProductType.BEAT,
    genre: "Trap",
    bpm: 135,
    musicalKey: "Gm",
    mood: "Club",
    description: "Trap oscuro con bounce moderno y espacio para hook pegajoso.",
    price: 4495,
    audioUrl: "/audio/demo-beat.mp3",
    imageUrl: "/images/beat-cover.svg",
    fileUrl: "/downloads/call-me-up.zip",
    active: true,
    createdAt: new Date()
  },
  {
    id: "static-drake-type",
    title: "Static",
    type: ProductType.BEAT,
    genre: "R&B Trap",
    bpm: 92,
    musicalKey: "Am",
    mood: "Late night",
    description: "Beat melodico tipo Drake/Gunna con textura premium.",
    price: 3995,
    audioUrl: "/audio/demo-beat.mp3",
    imageUrl: "/images/beat-cover.svg",
    fileUrl: "/downloads/static.zip",
    active: true,
    createdAt: new Date()
  },
  {
    id: "hurricane-afro-trap",
    title: "Hurricane",
    type: ProductType.BEAT,
    genre: "Afro Trap",
    bpm: 108,
    musicalKey: "Dm",
    mood: "Energy",
    description: "Percusion afro, bajo redondo y melodias oscuras.",
    price: 5000,
    audioUrl: "/audio/demo-beat.mp3",
    imageUrl: "/images/beat-cover.svg",
    fileUrl: "/downloads/hurricane.zip",
    active: true,
    createdAt: new Date()
  },
  {
    id: "money-rain-dembow",
    title: "Money Rain",
    type: ProductType.BEAT,
    genre: "Dembow",
    bpm: 110,
    musicalKey: "F#m",
    mood: "Street",
    description: "Dembow con energia calle y sonido listo para discoteca.",
    price: 4995,
    audioUrl: "/audio/demo-beat.mp3",
    imageUrl: "/images/beat-cover.svg",
    fileUrl: "/downloads/money-rain.zip",
    active: true,
    createdAt: new Date()
  },
  {
    id: "trap-vocal-chain",
    title: "Trap Vocal Chain",
    type: ProductType.PRESET,
    genre: "Trap",
    bpm: null,
    musicalKey: null,
    mood: "Radio ready",
    description: "Chain vocal lista para grabar con brillo, presencia y tuning controlado.",
    price: 1800,
    audioUrl: null,
    imageUrl: "/images/preset-cover.svg",
    fileUrl: "/downloads/trap-vocal-chain.zip",
    active: true,
    createdAt: new Date()
  },
  {
    id: "free-vocal-preset",
    title: "Free Vocal Preset",
    type: ProductType.PRESET,
    genre: "Free Product",
    bpm: null,
    musicalKey: null,
    mood: "Starter",
    description: "Preset gratis para probar el color vocal de Ellbopa Music.",
    price: 0,
    audioUrl: null,
    imageUrl: "/images/preset-cover.svg",
    fileUrl: "/downloads/free-vocal-preset.zip",
    active: true,
    createdAt: new Date()
  },
  {
    id: "rnb-silk-chain",
    title: "R&B Silk Chain",
    type: ProductType.PRESET,
    genre: "R&B",
    bpm: null,
    musicalKey: null,
    mood: "Smooth",
    description: "Cadena vocal limpia, brillante y suave para voces melodicas.",
    price: 2200,
    audioUrl: null,
    imageUrl: "/images/preset-cover.svg",
    fileUrl: "/downloads/rnb-silk-chain.zip",
    active: true,
    createdAt: new Date()
  },
  {
    id: "dembow-radio-ready",
    title: "Dembow Radio Ready",
    type: ProductType.PRESET,
    genre: "Dembow",
    bpm: null,
    musicalKey: null,
    mood: "Energetic",
    description: "Preset agresivo para voces urbanas con presencia y pegada.",
    price: 1800,
    audioUrl: null,
    imageUrl: "/images/preset-cover.svg",
    fileUrl: "/downloads/dembow-radio-ready.zip",
    active: true,
    createdAt: new Date()
  },
  {
    id: "detroit-clean-vocals",
    title: "Detroit Clean Vocals",
    type: ProductType.PRESET,
    genre: "Detroit",
    bpm: null,
    musicalKey: null,
    mood: "Clean",
    description: "Chain rap clara para voces secas, rapidas y al frente.",
    price: 1800,
    audioUrl: null,
    imageUrl: "/images/preset-cover.svg",
    fileUrl: "/downloads/detroit-clean-vocals.zip",
    active: true,
    createdAt: new Date()
  }
];

export async function getProducts(type?: ProductType) {
  const localProducts = await getLocalProducts(type);

  if (!process.env.DATABASE_URL) {
    return [...localProducts, ...fallbackProducts.filter((product) => !type || product.type === type)];
  }

  if (process.env.DATABASE_URL.includes("localhost:5432") || process.env.DATABASE_URL.includes("127.0.0.1:5432")) {
    const reachable = await canReachLocalPostgres();
    if (!reachable) {
      return [...localProducts, ...fallbackProducts.filter((product) => !type || product.type === type)];
    }
  }

  try {
    const dbProducts = await prisma.product.findMany({
      where: { active: true, ...(type ? { type } : {}) },
      orderBy: { createdAt: "desc" }
    });
    return [...localProducts, ...dbProducts];
  } catch {
    return [...localProducts, ...fallbackProducts.filter((product) => !type || product.type === type)];
  }
}

function canReachLocalPostgres() {
  return new Promise<boolean>((resolve) => {
    const socket = net.createConnection({ host: "127.0.0.1", port: 5432 });
    const done = (value: boolean) => {
      socket.destroy();
      resolve(value);
    };
    socket.setTimeout(250);
    socket.once("connect", () => done(true));
    socket.once("timeout", () => done(false));
    socket.once("error", () => done(false));
  });
}
