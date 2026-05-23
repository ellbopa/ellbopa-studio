import { MessageCircle } from "lucide-react";
import { whatsappUrl } from "@/lib/format";
import { getSiteConfig } from "@/lib/site-config";

export async function WhatsAppButton() {
  const config = await getSiteConfig();

  return (
    <a
      href={whatsappUrl(`Quiero reservar en ${config.brandName}.`, config.whatsapp)}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-green-500 text-white shadow-glow transition hover:scale-105"
      aria-label="Reservar por WhatsApp"
    >
      <MessageCircle />
    </a>
  );
}
