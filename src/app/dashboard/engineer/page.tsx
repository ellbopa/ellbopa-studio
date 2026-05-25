import { CalendarDays, FolderOpen, MessageSquare, SlidersHorizontal } from "lucide-react";
import { RoleDashboard } from "@/components/role-dashboard";
import { requireDashboardRole } from "@/app/dashboard/_lib";
import { CreatorWalletPanel } from "@/components/creator-wallet-panel";

export const metadata = { title: "Dashboard Ingeniero" };

export default async function EngineerDashboardPage() {
  const session = await requireDashboardRole("ENGINEER");
  return (
    <>
      <RoleDashboard
        eyebrow="Dashboard ingeniero"
        title="Servicios, entregas y archivos."
        description="Vende servicios de audio gratis. Ellbopa Studio solo cobra comision cuando cobras una orden."
        stats={[{ label: "Publicar", value: "Gratis" }, { label: "Comision", value: "20%" }, { label: "Tu recibes", value: "80%" }]}
        actions={[
          { label: "Crear servicio", href: "/servicios", icon: SlidersHorizontal },
          { label: "Ordenes de mezcla", href: "/cliente", icon: FolderOpen },
          { label: "Mensajes", href: "/cliente", icon: MessageSquare },
          { label: "Calendario", href: "/reservas", icon: CalendarDays }
        ]}
        sections={[
          { title: "Servicios", text: "Mezcla, mastering, vocal tuning y paquetes.", items: ["Precio base", "Revisiones", "Tiempo de entrega"] },
          { title: "Wallet", text: "Balance interno, ventas y retiros manuales.", items: ["Ganancia neta", "Comision", "Payouts"] },
          { title: "Clientes", text: "Seguimiento de trabajos.", items: ["Mensajes", "Estados", "Reviews"] }
        ]}
      />
      <div className="mx-auto max-w-7xl px-4 pb-14 sm:px-6">
        <CreatorWalletPanel userId={session.user.id} />
      </div>
    </>
  );
}
