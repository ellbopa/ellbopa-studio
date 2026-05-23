import { Upload } from "lucide-react";
import { requireDashboardRole } from "@/app/dashboard/_lib";

export const metadata = { title: "Subir Beat" };

export default async function ProducerUploadPage() {
  await requireDashboardRole("PRODUCER");

  return (
    <main className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <p className="text-sm font-black uppercase tracking-[0.26em] text-studio-gold">Productor</p>
      <h1 className="mt-4 font-display text-5xl font-black uppercase">Subir beat o sound kit</h1>
      <p className="mt-4 max-w-2xl text-white/62">Publica tu instrumental con portada, preview y archivo digital. Luego aparecera en el marketplace.</p>

      <section className="premium-card mt-8 rounded-lg p-6">
        <div className="mb-6 grid min-h-48 place-items-center rounded-lg border border-dashed border-studio-red/35 bg-black/35 text-center">
          <div>
            <Upload className="mx-auto mb-4 h-10 w-10 text-studio-red" />
            <p className="font-display text-2xl font-black">Upload Files</p>
            <p className="mt-2 text-sm text-white/45">MP3 preview, WAV/ZIP/STEMS y cover art</p>
          </div>
        </div>
        <form action="/api/admin/upload-product" method="POST" encType="multipart/form-data" className="grid gap-4 md:grid-cols-3">
          <Input name="title" label="Titulo" required />
          <label className="field">Tipo<select name="type" className="control"><option value="BEAT">Beat / Instrumental</option><option value="PRESET">Sound Kit / Preset</option></select></label>
          <Input name="genre" label="Genero" placeholder="Trap, R&B, Dembow" />
          <Input name="bpm" label="BPM" type="number" />
          <Input name="musicalKey" label="Key" placeholder="Fm, C#m..." />
          <Input name="mood" label="Mood" placeholder="Dark, luxury, street" />
          <Input name="price" label="Basic RD$" type="number" required />
          <Input name="premiumPrice" label="Premium RD$" type="number" />
          <Input name="exclusivePrice" label="Exclusive RD$" type="number" />
          <label className="field">Cover art<input name="image" type="file" accept="image/*" className="control" /></label>
          <label className="field">Audio preview<input name="audio" type="file" accept=".mp3,.wav,.m4a" className="control" /></label>
          <label className="field">Digital file<input name="file" type="file" accept=".zip,.wav,.mp3,.rar" className="control" /></label>
          <label className="field md:col-span-3">Descripcion<textarea name="description" required rows={3} className="control" /></label>
          <button className="rounded-md bg-studio-red px-5 py-3 font-black text-white glow-button md:col-span-3">Publicar producto</button>
        </form>
      </section>
    </main>
  );
}

function Input({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="field">
      {label}
      <input {...props} className="control" />
    </label>
  );
}
