import { ProductType } from "@prisma/client";
import { PresetCard } from "@/components/preset-card";
import { getProducts } from "@/lib/products";

export const metadata = { title: "Presets Store" };

export default async function PresetsPage() {
  const presets = await getProducts(ProductType.PRESET);

  return (
    <main>
      <section className="studio-grid py-12 text-white sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 flex flex-col gap-4 border-b border-white/10 pb-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.24em] text-studio-gold">Presets Store</p>
              <h1 className="mt-3 font-display text-4xl font-black sm:text-6xl">Vocal presets y chains listos</h1>
              <p className="mt-4 max-w-2xl text-white/62">
                Presets, templates y vocal chains para grabar rapido con sonido moderno. Compra, descarga y trabaja tu voz al frente.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {["Vocal Presets", "Mix Templates", "Chains", "Free Products"].map((filter) => (
                <span key={filter} className="rounded-full border border-studio-gold/20 bg-black/35 px-4 py-2 text-sm font-bold text-white/72">
                  {filter}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
            {presets.map((product, index) => <PresetCard key={`${product.id}-${index}`} product={product} index={index} />)}
          </div>
        </div>
      </section>
    </main>
  );
}
