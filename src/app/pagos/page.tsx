import { Landmark, MessageCircle, ShieldCheck } from "lucide-react";
import { Section } from "@/components/section";
import { ClearCartOnSuccess } from "@/components/clear-cart-on-success";
import { formatDop, whatsappUrl } from "@/lib/format";
import { getSiteConfig } from "@/lib/site-config";

export const metadata = { title: "Pagos" };

export default async function PaymentsPage({ searchParams }: { searchParams: Promise<{ manual?: string; amount?: string; order?: string; booking?: string }> }) {
  const params = await searchParams;
  const config = await getSiteConfig();
  const amount = Number(params.amount || 0);
  const reference = params.order || params.booking || "";

  return (
    <main>
      {params.manual ? <ClearCartOnSuccess /> : null}
      <Section eyebrow="Pagos" title="Paga por transferencia y confirma tu orden">
        <div className="mb-6 rounded-lg border border-studio-red/25 bg-studio-red/10 p-4 text-sm text-white/72">
          {params.manual ? "Tu compra fue creada y quedo pendiente por transferencia. Envia el comprobante por WhatsApp para confirmarla." : "Si Stripe no esta configurado, la web funciona por transferencia manual. Envia comprobante por WhatsApp y el admin actualiza tu estado."}
        </div>
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="premium-card rounded-lg p-6">
            <Landmark className="text-studio-gold" size={42} />
            <h2 className="mt-5 font-display text-2xl font-bold">Datos bancarios</h2>
            <p className="mt-4 text-xl font-bold text-studio-gold">{config.bankAccount}</p>
            <p className="mt-2 text-white/70">A nombre de {config.bankOwner}</p>
            {amount > 0 ? (
              <div className="mt-5 rounded-md border border-white/10 bg-black/40 p-4">
                <p className="text-sm text-white/55">Monto a transferir</p>
                <p className="mt-1 font-display text-3xl font-black text-studio-gold">{formatDop(amount)}</p>
                {reference ? <p className="mt-2 break-all text-xs text-white/45">Referencia: {reference}</p> : null}
              </div>
            ) : null}
            <p className="mt-6 rounded-md border border-studio-gold/25 bg-studio-gold/10 p-4 text-sm text-studio-gold">
              Las reservas se confirman solo cuando el deposito del 50% este recibido.
            </p>
          </div>
          <div className="premium-card rounded-lg p-6">
            <h2 className="font-display text-2xl font-bold">Pasos para confirmar</h2>
            <div className="mt-6 grid gap-4">
              {[
                "Elige beat, preset, mezcla online o reserva.",
                "Transfiere el 50% para reserva o el monto acordado para productos digitales.",
                "Envia comprobante por WhatsApp con tu nombre y servicio.",
                "Admin confirma y actualiza el estado de tu orden."
              ].map((step, index) => (
                <div key={step} className="flex gap-3 rounded-md border border-white/10 bg-black/35 p-4">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-studio-red font-bold">0{index + 1}</span>
                  <p className="text-white/72">{step}</p>
                </div>
              ))}
            </div>
            <a
              href={whatsappUrl("Hola, quiero enviar comprobante de pago.", config.whatsapp)}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-md bg-studio-red px-5 py-3 font-bold glow-button"
            >
              <MessageCircle size={18} /> Enviar comprobante
            </a>
            <p className="mt-4 flex items-center gap-2 text-sm text-white/55"><ShieldCheck size={16} /> Procesos claros para artistas locales y extranjeros.</p>
          </div>
        </div>
      </Section>
    </main>
  );
}
