import { CalendarDays, Download, Heart, ShoppingBag } from "lucide-react";
import { RoleDashboard } from "@/components/role-dashboard";
import { requireDashboardRole } from "@/app/dashboard/_lib";

export const metadata = { title: "Dashboard Artista" };

export default async function ArtistDashboardPage() {
  await requireDashboardRole("ARTIST");
  return (
    <RoleDashboard
      eyebrow="Dashboard artista"
      title="Tu musica, compras y reservas."
      description="Area enfocada en comprar beats, contratar servicios, descargar productos y separar sesiones de estudio."
      stats={[{ label: "Compras", value: "Mis compras" }, { label: "Reservas", value: "Studio" }, { label: "Cuenta", value: "Activa" }]}
      actions={[
        { label: "Mis compras", href: "/compras", icon: ShoppingBag },
        { label: "Descargas", href: "/compras", icon: Download },
        { label: "Favoritos", href: "/compras", icon: Heart },
        { label: "Reservar estudio", href: "/reservas", icon: CalendarDays }
      ]}
      sections={[
        { title: "Ordenes", text: "Historial de beats, presets y servicios contratados.", items: ["Ver estados", "Pagar depositos", "Abrir descargas privadas"] },
        { title: "Mensajes", text: "Contacto con el estudio y seguimiento de trabajos.", items: ["Enviar notas", "Revisiones", "Soporte"] },
        { title: "Configuracion", text: "Perfil basico de artista.", items: ["Nombre artistico", "Instagram", "Generos favoritos"] }
      ]}
    />
  );
}
