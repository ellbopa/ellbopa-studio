import { Section } from "@/components/section";
import { services } from "@/lib/demo-data";

export const metadata = { title: "Reservas" };

export default async function BookingPage({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const params = await searchParams;

  return (
    <main>
      <Section eyebrow="Reservas" title="Elige fecha y separa tu sesion con 50%">
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          {["50% obligatorio", "Confirmacion por admin", "Presencial u online"].map((item) => (
            <div key={item} className="premium-card rounded-lg p-4 text-sm font-bold text-white/72">
              <span className="mr-2 text-studio-gold">/</span>{item}
            </div>
          ))}
        </div>
        <form action="/api/bookings" method="POST" className="premium-card grid gap-5 rounded-lg p-6 md:grid-cols-2">
          <input type="hidden" name="totalAmount" value="5000" />
          <div>
            <label className="text-sm text-white/70">Nombre artistico / manager</label>
            <input name="artistName" placeholder="Ej: Adonis Castillo / Manager de..." className="mt-2 w-full rounded-md border border-white/10 bg-black px-4 py-3" />
          </div>
          <div>
            <label className="text-sm text-white/70">WhatsApp</label>
            <input name="phone" placeholder="+1 809..." className="mt-2 w-full rounded-md border border-white/10 bg-black px-4 py-3" />
          </div>
          <div>
            <label className="text-sm text-white/70">Servicio</label>
            <select name="serviceType" defaultValue={params.service} className="mt-2 w-full rounded-md border border-white/10 bg-black px-4 py-3">
              {services.map((service) => <option key={service.title}>{service.title}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm text-white/70">Fecha</label>
            <input name="date" type="date" required className="mt-2 w-full rounded-md border border-white/10 bg-black px-4 py-3" />
          </div>
          <div>
            <label className="text-sm text-white/70">Hora</label>
            <input name="time" type="time" required className="mt-2 w-full rounded-md border border-white/10 bg-black px-4 py-3" />
          </div>
          <div>
            <label className="text-sm text-white/70">Modalidad</label>
            <select name="bookingMode" className="mt-2 w-full rounded-md border border-white/10 bg-black px-4 py-3">
              <option>Presencial en estudio</option>
              <option>Online / extranjero</option>
              <option>Entrega de stems</option>
              <option>Consulta para manager</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-white/70">Estado inicial</label>
            <input readOnly value="Pendiente hasta pagar deposito" className="mt-2 w-full rounded-md border border-white/10 bg-black px-4 py-3 text-white/60" />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm text-white/70">Notas</label>
            <textarea name="notes" rows={5} className="mt-2 w-full rounded-md border border-white/10 bg-black px-4 py-3" />
          </div>
          <button className="rounded-md bg-studio-red px-5 py-3 font-bold glow-button md:col-span-2">
            Crear reserva pendiente
          </button>
        </form>
      </Section>
    </main>
  );
}
