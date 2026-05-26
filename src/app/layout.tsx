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

  return (
    <html lang="es" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        style={
          {
            "--cms-red": primary,
            "--cms-gold": config.goldColor,
            "--brand-primary": primary,
            "--brand-primary-hover": `color-mix(in srgb, ${primary} 82%, white)`,
            "--brand-glow": `color-mix(in srgb, ${primary} 36%, transparent)`,
            "--brand-border": `color-mix(in srgb, ${primary} 42%, transparent)`
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
