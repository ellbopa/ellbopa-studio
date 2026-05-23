export type CartItem = {
  id: string;
  title: string;
  type: string;
  price: number;
  license?: string | null;
  licenseLabel?: string | null;
  imageUrl?: string | null;
  audioUrl?: string | null;
  genre?: string | null;
};

export const cartStorageKey = "ellbopa_cart";
