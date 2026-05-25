import { BarChart3, CreditCard, Music2, Upload } from "lucide-react";
import { RoleDashboard } from "@/components/role-dashboard";
import { requireDashboardRole } from "@/app/dashboard/_lib";
import { CreatorWalletPanel } from "@/components/creator-wallet-panel";

export const metadata = { title: "Dashboard Productor" };

export default async function ProducerDashboardPage() {
  const session = await requireDashboardRole("PRODUCER");
  return (
    <>
      <RoleDashboard
        eyebrow="Dashboard productor"
        title="Vende beats y maneja tu catalogo."
        description="Registrarte, subir y publicar es gratis. Ellbopa Studio solo cobra comision cuando haces una venta."
        stats={[{ label: "Publicar", value: "Gratis" }, { label: "Comision", value: "20%" }, { label: "Tu recibes", value: "80%" }]}
        actions={[
          { label: "Subir beat", href: "/dashboard/producer/upload", icon: Upload },
          { label: "Mis beats", href: "/beats", icon: Music2 },
          { label: "Ventas", href: "/dashboard/producer", icon: CreditCard },
          { label: "Analytics", href: "/dashboard/producer", icon: BarChart3 }
        ]}
        sections={[
          { title: "Catalogo", text: "Sube beats, sound kits, archivos digitales y portadas sin membresia obligatoria.", items: ["MP3/WAV/STEMS", "Licencias", "Precios"] },
          { title: "Wallet", text: "Cada venta suma automaticamente tu ganancia neta.", items: ["80% creador", "20% plataforma", "Payouts manuales"] },
          { title: "Clientes", text: "Ventas, mensajes y seguimiento.", items: ["Ordenes", "Descargas", "Pagos"] }
        ]}
      />
      <div className="mx-auto max-w-7xl px-4 pb-14 sm:px-6">
        <CreatorWalletPanel userId={session.user.id} />
      </div>
    </>
  );
}
