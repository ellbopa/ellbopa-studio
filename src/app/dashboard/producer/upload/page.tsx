import { Upload } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { canUploadProducts } from "@/lib/roles";
import { isAdminUser } from "@/lib/admin";
import { ProductUploadForm } from "@/components/product-upload-form";

export const metadata = { title: "Subir Beat" };

export default async function ProducerUploadPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?next=/dashboard/producer/upload");
  if (!canUploadProducts(session.user.role) && !isAdminUser(session.user)) redirect("/");
  const uploadConfigured = Boolean(process.env.UPLOADTHING_TOKEN || (process.env.UPLOADTHING_SECRET && process.env.UPLOADTHING_APP_ID));

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
        <ProductUploadForm uploadConfigured={uploadConfigured} returnTo="producer" />
      </section>
    </main>
  );
}
