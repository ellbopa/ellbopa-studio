import { CheckCircle2 } from "lucide-react";
import { CtaButton } from "@/components/cta-button";
import { Section } from "@/components/section";
import { whatsappUrl } from "@/lib/format";
import { getSiteConfig } from "@/lib/site-config";

export const metadata = { title: "Gracias" };

export default async function ThanksPage({ searchParams }: { searchParams: Promise<{ tipo?: string }> }) {
  const params = await searchParams;
  const tipo = params.tipo ?? "solicitud";
  const config = await getSiteConfig();

  return (
    <main>
      <Section eyebrow="Recibido" title="Tu solicitud quedo registrada">
        <div className="premium-card mx-auto max-w-2xl rounded-lg p-8 text-center">
          <CheckCircle2 className="mx-auto text-studio-gold" size={54} />
          <p className="mt-5 text-lg leading-8 text-white/72">
            Recibimos tu {tipo}. Para confirmar una reserva o iniciar un trabajo, recuerda que se requiere el 50% por adelantado.
          </p>
          <p className="mt-4 rounded-md border border-studio-gold/25 bg-studio-gold/10 p-4 text-sm text-studio-gold">
            {config.bankAccount} · {config.bankOwner}
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <a href={whatsappUrl(`Ya envie una solicitud en la web de ${config.brandName}.`, config.whatsapp)} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center rounded-md bg-studio-red px-5 py-3 text-sm font-bold text-white glow-button">
              Confirmar por WhatsApp
            </a>
            <CtaButton href="/" variant="secondary">Volver al inicio</CtaButton>
          </div>
        </div>
      </Section>
    </main>
  );
}
