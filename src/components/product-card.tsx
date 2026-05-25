import Image from "next/image";
import { Crown, MessageCircle, ShoppingCart } from "lucide-react";
import { formatDop, whatsappUrl } from "@/lib/format";
import { getSiteConfig } from "@/lib/site-config";
import { AudioPreviewPlayer } from "@/components/audio-preview-player";

type ProductCardProps = {
  product: {
    id: string;
    title: string;
    genre?: string | null;
    bpm?: number | null;
    musicalKey?: string | null;
    mood?: string | null;
    description: string;
    price: number;
    premiumPrice?: number | null;
    exclusivePrice?: number | null;
    imageUrl?: string | null;
    audioUrl?: string | null;
  };
};

export async function ProductCard({ product }: ProductCardProps) {
  const config = await getSiteConfig();
  const licenses = [
    { name: "Basica", price: product.price, mode: "basic" },
    { name: "Premium", price: product.premiumPrice || Math.round(product.price * 1.8), mode: "premium" },
    { name: "Unlimited", price: product.exclusivePrice || Math.round(product.price * 4), mode: "unlimited" }
  ];

  return (
    <article className="premium-card group overflow-hidden rounded-lg transition duration-300 hover:-translate-y-1 hover:border-studio-gold/35 hover:shadow-gold">
      <div className="relative aspect-[16/10] bg-studio-smoke">
        <Image
          src={product.imageUrl || "/images/beat-cover.svg"}
          alt={product.title}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
      <div className="space-y-4 p-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-studio-gold">{product.genre || "Ellbopa"}</p>
          <h3 className="mt-2 font-display text-xl font-bold">{product.title}</h3>
        </div>
        <p className="text-sm leading-6 text-white/65">{product.description}</p>
        <div className="flex flex-wrap gap-2 text-xs text-white/65">
          {product.bpm ? <span className="rounded bg-white/8 px-2 py-1">{product.bpm} BPM</span> : null}
          {product.musicalKey ? <span className="rounded bg-white/8 px-2 py-1">{product.musicalKey}</span> : null}
          {product.mood ? <span className="rounded bg-white/8 px-2 py-1">{product.mood}</span> : null}
        </div>
        {product.audioUrl ? <AudioPreviewPlayer audioUrl={product.audioUrl} title={product.title} /> : null}
        <div className="grid gap-2">
          {licenses.map((license) => (
            <form key={license.mode} action="/api/checkout" method="POST" className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-black/35 p-3">
              <input type="hidden" name="productId" value={product.id} />
              <input type="hidden" name="mode" value="full" />
              <div>
                <p className="flex items-center gap-2 text-sm font-bold">
                  {license.mode === "unlimited" ? <Crown size={14} className="text-studio-gold" /> : null}
                  Licencia {license.name}
                </p>
                <strong className="font-display text-lg text-studio-gold">{formatDop(license.price)}</strong>
              </div>
              <button className="inline-flex items-center gap-2 rounded-md bg-studio-red px-3 py-2 text-xs font-bold text-white glow-button transition hover:scale-[1.03]">
                <ShoppingCart size={14} /> Comprar
              </button>
            </form>
          ))}
          <a
            href={whatsappUrl(`Quiero comprar ${product.title} por transferencia.`, config.whatsapp)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-studio-gold/35 px-4 py-3 text-sm font-bold text-studio-gold transition hover:bg-studio-gold hover:text-black"
          >
            <MessageCircle size={16} /> Pagar por transferencia
          </a>
        </div>
      </div>
    </article>
  );
}
