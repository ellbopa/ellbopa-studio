import { CalendarDays, CreditCard, MapPin, Settings } from "lucide-react";
import { RoleDashboard } from "@/components/role-dashboard";
import { requireDashboardRole } from "@/app/dashboard/_lib";

export const metadata = { title: "Dashboard Estudio" };

export default async function StudioDashboardPage() {
  await requireDashboardRole("STUDIO");
  return (
    <RoleDashboard
      eyebrow="Dashboard estudio"
      title="Reservas, horarios y depositos."
      description="Panel para manejar sesiones fisicas, servicios del estudio, precios por hora, fotos, equipo y calendario."
      stats={[{ label: "Reservas", value: "Calendar" }, { label: "Depositos", value: "50%" }, { label: "Studio", value: "Activo" }]}
      actions={[
        { label: "Reservas", href: "/reservas", icon: CalendarDays },
        { label: "Ubicacion", href: "/contacto", icon: MapPin },
        { label: "Depositos", href: "/pagos", icon: CreditCard },
        { label: "Settings", href: "/cliente", icon: Settings }
      ]}
      sections={[
        { title: "Calendario", text: "Organiza horarios y sesiones.", items: ["Fechas", "Horas", "Recordatorios"] },
        { title: "Servicios", text: "Grabacion, mezcla y paquetes del estudio.", items: ["Precios por hora", "Depositos", "Servicios"] },
        { title: "Equipo", text: "Muestra fotos, cabina y equipo disponible.", items: ["Fotos", "Microfonos", "Consola"] }
      ]}
    />
  );
}
