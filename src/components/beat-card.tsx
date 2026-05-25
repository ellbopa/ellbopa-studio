import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Sparkles, Verified } from "lucide-react";
import { formatDop } from "@/lib/format";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { FavoriteButton } from "@/components/favorite-button";
import { AudioPreviewPlayer } from "@/components/audio-preview-player";

type BeatCardProps = {
  product: {
    id: string;
    title: string;
    genre?: string | null;
    bpm?: number | null;
    musicalKey?: string | null;
    mood?: string | null;
    price: number;
    imageUrl?: string | null;
    audioUrl?: string | null;
  };
  index?: number;
  isFavorite?: boolean;
};

export function BeatCard({ product, index = 0, isFavorite = false }: BeatCardProps) {
  const producers = ["Ellbopa", "Adonis", "Studio Plug", "Invivienda Sound", "Los Mina Lab"];
  const producer = producers[index % producers.length];

  return (
    <article className="group beat-tile">
      <div className="relative aspect-square overflow-hidden rounded-lg border border-white/10 bg-studio-smoke shadow-[0_20px_55px_rgba(0,0,0,.35)]">
        <Image
          src={product.imageUrl || "/images/beat-cover.svg"}
          alt={product.title}
          fill
          sizes="(min-width: 1280px) 20vw, (min-width: 768px) 33vw, 100vw"
          className="object-contain p-3 transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,transparent,rgba(0,0,0,.62)_78%)] opacity-0 transition group-hover:opacity-100" />
        <div className="absolute right-3 top-3"><FavoriteButton productId={product.id} active={isFavorite} next="/beats" /></div>
      </div>

      <div className="mt-4">
        <Link href={`/producto/${encodeURIComponent(product.id)}`} className="line-clamp-1 text-lg font-black text-white transition hover:text-studio-gold">
          <Sparkles className="mr-1 inline h-4 w-4 text-studio-red" />
          {product.title}
        </Link>
        <p className="mt-1 flex items-center gap-1 text-sm text-white/52">
          {producer}
          {index % 3 === 0 ? <Verified size={14} className="fill-blue-500 text-blue-500" /> : null}
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/58">
          {product.genre ? <span>{product.genre}</span> : null}
          {product.bpm ? <span>{product.bpm} BPM</span> : null}
          {product.musicalKey ? <span>{product.musicalKey}</span> : null}
          {product.mood ? <span>{product.mood}</span> : null}
        </div>
        {product.audioUrl ? (
          <div className="mt-3">
            <AudioPreviewPlayer audioUrl={product.audioUrl} title={product.title} compact />
          </div>
        ) : (
          <p className="mt-3 rounded-md border border-white/10 bg-black/45 px-3 py-2 text-xs font-bold text-white/40">Preview pendiente</p>
        )}

        <div className="mt-4 grid gap-2">
        <AddToCartButton
          item={{
            id: product.id,
            title: product.title,
            type: "BEAT",
            price: product.price,
            imageUrl: product.imageUrl,
            audioUrl: product.audioUrl,
            genre: product.genre
          }}
        />
        <Link href={`/checkout?productId=${encodeURIComponent(product.id)}`} className="flex w-full items-center justify-center gap-2 rounded-md border border-studio-red/45 bg-black/80 px-4 py-3 text-sm font-black text-white shadow-[0_0_24px_rgba(229,9,20,.12)] transition hover:border-studio-red hover:bg-studio-red hover:shadow-glow">
            <ShoppingBag size={16} /> {formatDop(product.price)}
        </Link>
        </div>
      </div>
    </article>
  );
}
