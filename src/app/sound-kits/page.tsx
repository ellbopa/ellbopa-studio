import { ProductType } from "@prisma/client";
import { PresetCard } from "@/components/preset-card";
import { getProducts } from "@/lib/products";

export const metadata = {
  title: "Sound Kits",
  description: "Drum kits, loops, samples y recursos digitales de Ellbopa Music."
};

export default async function SoundKitsPage() {
  const kits = await getProducts(ProductType.SOUND_KIT);

  return (
    <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <p className="text-sm font-black uppercase tracking-[0.24em] text-studio-gold">Sound Kits</p>
      <h1 className="mt-3 font-display text-5xl font-black uppercase">Kits para producir con sonido Ellbopa.</h1>
      <p className="mt-4 max-w-2xl text-white/62">Drums, loops, one-shots y packs digitales con descarga privada despues del pago.</p>
      <div className="mt-10 grid gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {kits.length === 0 ? <div className="premium-card rounded-lg p-8 text-white/70">Todavia no hay sound kits publicados.</div> : null}
        {kits.map((product, index) => <PresetCard key={product.id} product={product} index={index} />)}
      </div>
    </main>
  );
}
