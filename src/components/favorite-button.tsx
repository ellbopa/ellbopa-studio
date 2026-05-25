import { Heart } from "lucide-react";

export function FavoriteButton({ productId, active = false, next = "/beats" }: { productId: string; active?: boolean; next?: string }) {
  return (
    <form action="/api/favorites" method="POST">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="next" value={next} />
      <button
        className={`grid h-9 w-9 place-items-center rounded-full bg-black/60 backdrop-blur transition hover:text-studio-gold ${active ? "text-studio-gold" : "text-white/72"}`}
        aria-label={active ? "Quitar de favoritos" : "Guardar favorito"}
      >
        <Heart size={16} className={active ? "fill-current" : ""} />
      </button>
    </form>
  );
}
