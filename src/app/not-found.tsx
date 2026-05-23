import { CtaButton } from "@/components/cta-button";
import { Section } from "@/components/section";

export default function NotFound() {
  return (
    <main>
      <Section eyebrow="404" title="Esa ruta no existe">
        <div className="premium-card mx-auto max-w-xl rounded-lg p-8 text-center">
          <p className="text-white/70">La pagina que buscas no esta disponible. Vuelve al estudio y seguimos trabajando.</p>
          <CtaButton href="/" className="mt-6">Volver al inicio</CtaButton>
        </div>
      </Section>
    </main>
  );
}
