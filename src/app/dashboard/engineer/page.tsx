import { CalendarDays, FolderOpen, MessageSquare, SlidersHorizontal } from "lucide-react";
import { RoleDashboard } from "@/components/role-dashboard";
import { requireDashboardRole } from "@/app/dashboard/_lib";

export const metadata = { title: "Dashboard Ingeniero" };

export default async function EngineerDashboardPage() {
  await requireDashboardRole("ENGINEER");
  return (
    <RoleDashboard
      eyebrow="Dashboard ingeniero"
      title="Servicios, entregas y archivos."
      description="Panel para vender mezcla, mastering, vocal tuning, administrar entregas y responder clientes."
      stats={[{ label: "Servicios", value: "Audio" }, { label: "Ordenes", value: "Mix" }, { label: "Entregas", value: "Files" }]}
      actions={[
        { label: "Crear servicio", href: "/servicios", icon: SlidersHorizontal },
        { label: "Ordenes de mezcla", href: "/cliente", icon: FolderOpen },
        { label: "Mensajes", href: "/cliente", icon: MessageSquare },
        { label: "Calendario", href: "/reservas", icon: CalendarDays }
      ]}
      sections={[
        { title: "Servicios", text: "Mezcla, mastering, vocal tuning y paquetes.", items: ["Precio base", "Revisiones", "Tiempo de entrega"] },
        { title: "Archivos", text: "Recibe stems, referencias y notas.", items: ["WAV/MP3/ZIP", "Antes/despues", "Entregas finales"] },
        { title: "Clientes", text: "Seguimiento de trabajos.", items: ["Mensajes", "Estados", "Reviews"] }
      ]}
    />
  );
}
