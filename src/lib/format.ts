export function formatDop(amount: number) {
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "DOP",
    maximumFractionDigits: 0
  }).format(amount);
}

export function whatsappUrl(message: string, overridePhone?: string) {
  const phone = overridePhone ?? process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "18095903643";
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
