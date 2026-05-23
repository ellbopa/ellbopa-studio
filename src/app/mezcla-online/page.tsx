import { Section } from "@/components/section";

export const metadata = { title: "Mezcla Online" };

export default function MixOnlinePage() {
  return (
    <main>
      <Section eyebrow="Mezcla/Master Online" title="Sube tu cancion y crea una orden">
        <div className="mb-6 grid gap-4 md:grid-cols-4">
          {["WAV / MP3 / ZIP", "BPM y tono", "Referencia artistica", "Entrega digital"].map((item) => (
            <div key={item} className="premium-card rounded-lg p-4 text-sm font-bold text-white/72">
              <span className="mr-2 text-studio-red">REC</span>{item}
            </div>
          ))}
        </div>
        <form action="/api/orders" method="POST" encType="multipart/form-data" className="premium-card grid gap-5 rounded-lg p-6 md:grid-cols-2">
          <input type="hidden" name="serviceType" value="Mezcla y Master Online" />
          <input type="hidden" name="totalAmount" value="5000" />
          <Field label="Nombre artistico" name="artistName" placeholder="Tu nombre o artista del manager" />
          <Field label="Pais / ciudad" name="country" placeholder="Ej: New York, España, Santo Domingo" />
          <div>
            <label className="text-sm text-white/70">Tipo de cliente</label>
            <select name="clientType" className="mt-2 w-full rounded-md border border-white/10 bg-black px-4 py-3">
              <option>Artista</option>
              <option>Manejador / Manager</option>
              <option>Cliente extranjero</option>
              <option>Productor</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-white/70">Tipo de archivos</label>
            <select name="fileType" className="mt-2 w-full rounded-md border border-white/10 bg-black px-4 py-3">
              <option>Stems separados</option>
              <option>Voz + instrumental</option>
              <option>Solo voz</option>
              <option>Sesion completa ZIP</option>
            </select>
          </div>
          <Field label="BPM" name="bpm" type="number" />
          <Field label="Tono" name="musicalKey" placeholder="Ej: Fm" />
          <Field label="Genero" name="genre" placeholder="Trap, R&B, Detroit, Dembow" />
          <Field label="Artista de referencia" name="referenceArtist" placeholder="Ej: Bad Bunny, Eladio, Drake" />
          <div className="md:col-span-2">
            <label className="text-sm text-white/70">Archivos WAV/MP3/ZIP/RAR o stems</label>
            <input name="files" type="file" accept=".wav,.mp3,.zip,.rar" className="mt-2 w-full rounded-md border border-white/10 bg-black px-4 py-3" />
            <p className="mt-2 text-xs text-white/48">Sube stems, voces, instrumental o sesion comprimida. Si eres extranjero, puedes enviar todo online.</p>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm text-white/70">Notas</label>
            <textarea name="notes" rows={5} className="mt-2 w-full rounded-md border border-white/10 bg-black px-4 py-3" />
          </div>
          <div className="rounded-md border border-studio-gold/25 bg-studio-gold/10 p-4 text-sm text-studio-gold md:col-span-2">
            Para iniciar el trabajo se requiere 50% por adelantado. Puedes pagar por transferencia o completar checkout cuando este activo.
          </div>
          <button className="premium-action rounded-md bg-studio-red px-5 py-3 font-bold glow-button md:col-span-2">Crear orden</button>
        </form>
      </Section>
    </main>
  );
}

function Field({ label, name, type = "text", placeholder = "" }: { label: string; name: string; type?: string; placeholder?: string }) {
  return (
    <div>
      <label className="text-sm text-white/70">{label}</label>
      <input name={name} type={type} placeholder={placeholder} className="mt-2 w-full rounded-md border border-white/10 bg-black px-4 py-3" />
    </div>
  );
}
