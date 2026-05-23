import { BarChart3, CreditCard, Music2, Upload } from "lucide-react";
import { RoleDashboard } from "@/components/role-dashboard";
import { requireDashboardRole } from "@/app/dashboard/_lib";

export const metadata = { title: "Dashboard Productor" };

export default async function ProducerDashboardPage() {
  await requireDashboardRole("PRODUCER");
  return (
    <RoleDashboard
      eyebrow="Dashboard productor"
      title="Vende beats y maneja tu catalogo."
      description="Herramientas para subir instrumentales, crear licencias, revisar ventas, responder clientes y construir tu perfil publico."
      stats={[{ label: "Catalogo", value: "Beats" }, { label: "Ventas", value: "Analytics" }, { label: "Perfil", value: "Publico" }]}
      actions={[
        { label: "Subir beat", href: "/dashboard/producer/upload", icon: Upload },
        { label: "Mis beats", href: "/beats", icon: Music2 },
        { label: "Ventas", href: "/compras", icon: CreditCard },
        { label: "Analytics", href: "/dashboard/producer", icon: BarChart3 }
      ]}
      sections={[
        { title: "Catalogo", text: "Sube beats, sound kits, archivos digitales y portadas.", items: ["MP3/WAV/STEMS", "Licencias", "Precios"] },
        { title: "Perfil publico", text: "Tu identidad de productor dentro del marketplace.", items: ["Bio", "Ubicacion", "Redes sociales"] },
        { title: "Clientes", text: "Ventas, mensajes y seguimiento.", items: ["Ordenes", "Descargas", "Pagos"] }
      ]}
    />
  );
}
