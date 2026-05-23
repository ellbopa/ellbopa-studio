import Image from "next/image";
import Link from "next/link";
import { Download, MessageCircle, ShoppingBag, Star } from "lucide-react";
import { formatDop, whatsappUrl } from "@/lib/format";
import { getSiteConfig } from "@/lib/site-config";
import { AddToCartButton } from "@/components/add-to-cart-button";

type PresetCardProps = {
  product: {
    id: string;
    title: string;
    genre?: string | null;
    mood?: string | null;
    description: string;
    price: number;
    imageUrl?: string | null;
    fileUrl?: string | null;
  };
  index?: number;
};

export async function PresetCard({ product, index = 0 }: PresetCardProps) {
  const config = await getSiteConfig();
  const isFree = product.price <= 0;
  const originalPrice = isFree ? 0 : Math.max(product.price + 1200, Math.round(product.price * 1.65));
  const reviews = 58 + ((index * 17) % 91);

  return (
    <article className="premium-card group relative rounded-lg p-4 text-white transition duration-300 hover:-translate-y-1 hover:border-studio-gold/35 hover:shadow-gold">
      <div className="relative mx-auto aspect-[4/5] w-full max-w-[280px]">
        <div className="absolute inset-x-8 bottom-4 h-12 rounded-full bg-studio-red/20 blur-2xl transition group-hover:bg-studio-gold/20" />
        <Image
          src={product.imageUrl || "/images/preset-cover.svg"}
          alt={product.title}
          fill
          className="object-contain drop-shadow-[0_22px_22px_rgba(0,0,0,.22)] transition duration-500 group-hover:scale-105"
        />
      </div>

      <div className="mt-4 min-h-[190px] text-center">
        {!isFree ? (
          <span className="inline-flex rounded bg-studio-red px-4 py-1 text-xs font-black uppercase tracking-wide text-white shadow-glow">
            Sale
          </span>
        ) : (
          <span className="inline-flex rounded bg-studio-gold px-4 py-1 text-xs font-black uppercase tracking-wide text-black">
            Free
          </span>
        )}

        <h3 className="mt-5 font-display text-2xl font-black tracking-wide">{product.title}</h3>
        <p className="mt-2 text-xs uppercase tracking-[0.18em] text-studio-gold">{product.genre || product.mood || "Vocal Preset"}</p>

        <div className="mt-3 flex items-center justify-center gap-1 text-white">
          {Array.from({ length: 5 }).map((_, starIndex) => (
            <Star key={starIndex} size={14} className="fill-studio-gold text-studio-gold" />
          ))}
          <span className="ml-2 text-sm text-white/55">({reviews})</span>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          {!isFree ? <span className="text-sm text-white/35 line-through">{formatDop(originalPrice)}</span> : null}
          <strong className="font-display text-xl text-studio-gold">{isFree ? "RD$ 0.00 DOP" : formatDop(product.price)}</strong>
        </div>

        <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-white/58">{product.description}</p>
      </div>

      <div className="mt-4 grid gap-2">
        {!isFree ? (
          <AddToCartButton
            item={{
              id: product.id,
              title: product.title,
              type: "PRESET",
              price: product.price,
              imageUrl: product.imageUrl,
              genre: product.genre
            }}
          />
        ) : null}
        <Link href={`/checkout?productId=${encodeURIComponent(product.id)}`} className="flex w-full items-center justify-center gap-2 rounded-md bg-studio-red px-4 py-3 text-sm font-black text-white glow-button transition hover:scale-[1.02]">
            {isFree ? <Download size={16} /> : <ShoppingBag size={16} />}
            {isFree ? "Descargar" : "Comprar preset"}
        </Link>
        <a
          href={whatsappUrl(`Quiero comprar el preset ${product.title} por transferencia.`, config.whatsapp)}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 rounded-md border border-studio-gold/35 px-4 py-3 text-sm font-bold text-studio-gold transition hover:bg-studio-gold hover:text-black"
        >
          <MessageCircle size={16} /> Transferencia
        </a>
      </div>
    </article>
  );
}
