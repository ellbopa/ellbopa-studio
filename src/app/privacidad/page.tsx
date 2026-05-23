import { Section } from "@/components/section";

export const metadata = { title: "Privacidad" };

export default function PrivacyPage() {
  return (
    <main>
      <Section eyebrow="Privacidad" title="Tus datos se manejan con respeto">
        <div className="premium-card rounded-lg p-6 leading-8 text-white/70">
          <p>Usamos tus datos para gestionar cuentas, reservas, pagos, archivos y comunicacion del estudio.</p>
          <p className="mt-4">No vendemos tu informacion. Los pagos se procesan por Stripe y los archivos se preparan para almacenamiento seguro tipo S3/UploadThing.</p>
          <p className="mt-4">Puedes pedir actualizacion o eliminacion de tus datos escribiendo por WhatsApp a Ellbopa Music.</p>
        </div>
      </Section>
    </main>
  );
}
