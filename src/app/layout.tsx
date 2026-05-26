import type { Metadata } from "next";
import { Header } from "@/components/header";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { AnimatedBackground } from "@/components/animated-background";
import { AiAssistant } from "@/components/ai-assistant";
import { Footer } from "@/components/footer";
import { ActivityTracker } from "@/components/activity-tracker";
import { getSiteConfig } from "@/lib/site-config";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Ellbopa Music | Grabacion, mezcla y beats en Santo Domingo",
    template: "%s | Ellbopa Music"
  },
  description:
    "Estudio musical urbano en Santo Domingo, RD. Grabacion profesional, mezcla, mastering, beats, presets y servicios online.",
  keywords: ["Ellbopa Music", "estudio musical Santo Domingo", "mezcla mastering RD", "beats dominicanos"],
  openGraph: {
    title: "Ellbopa Music",
    description: "Graba, mezcla y lanza tu proximo hit en Ellbopa Music.",
    type: "website",
    locale: "es_DO"
  }
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const config = await getSiteConfig();
  const primary = config.primaryColor || "#ff1f1f";
  const gold = config.goldColor || "#d9a441";
  const primaryRgb = hexToRgb(primary, "255 31 31");
  const goldRgb = hexToRgb(gold, "217 164 65");

  return (
    <html lang="es" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        style={
          {
            "--cms-red": primary,
            "--cms-gold": gold,
            "--color-studio-red": primaryRgb,
            "--color-studio-gold": goldRgb,
            "--brand-primary": primary,
            "--brand-primary-hover": `color-mix(in srgb, ${primary} 82%, white)`,
            "--brand-glow": `color-mix(in srgb, ${primary} 36%, transparent)`,
            "--brand-border": `color-mix(in srgb, ${primary} 42%, transparent)`,
            "--brand-gradient": `linear-gradient(135deg, ${primary}, color-mix(in srgb, ${primary} 48%, ${gold}))`
          } as React.CSSProperties
        }
      >
        <AnimatedBackground />
        <Header />
        {children}
        <Footer />
        <AiAssistant />
        <WhatsAppButton />
        <ActivityTracker />
      </body>
    </html>
  );
}

function hexToRgb(value: string, fallback: string) {
  const match = value.trim().match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!match) return fallback;
  const [, r, g, b] = match;
  return `${parseInt(r, 16)} ${parseInt(g, 16)} ${parseInt(b, 16)}`;
}
