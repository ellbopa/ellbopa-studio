import { Section } from "@/components/section";

export const metadata = { title: "Terminos" };

export default function TermsPage() {
  return (
    <main>
      <Section eyebrow="Terminos" title="Reglas claras para trabajar serio">
        <div className="premium-card rounded-lg p-6 leading-8 text-white/70">
          <p>Las reservas solo se confirman con el 50% pagado por adelantado.</p>
          <p className="mt-4">Los precios pueden negociarse dentro de los rangos publicados, pero el deposito mantiene la fecha y prioridad.</p>
          <p className="mt-4">Los archivos finales se entregan cuando el pago acordado esta completo y el trabajo esta marcado como completado.</p>
        </div>
      </Section>
    </main>
  );
}
