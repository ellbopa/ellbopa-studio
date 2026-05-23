import { AlertTriangle } from "lucide-react";

export function ConfigNotice({ title = "Configuracion pendiente" }: { title?: string }) {
  return (
    <div className="premium-card mx-auto max-w-3xl rounded-lg p-6">
      <div className="flex items-start gap-4">
        <AlertTriangle className="mt-1 shrink-0 text-studio-gold" />
        <div>
          <h2 className="font-display text-2xl font-bold">{title}</h2>
          <p className="mt-3 leading-7 text-white/65">
            La pagina esta funcionando, pero esta seccion necesita PostgreSQL activo y migrado para leer datos reales.
            Inicia la base de datos, revisa `DATABASE_URL` y ejecuta `npx prisma migrate dev`.
          </p>
        </div>
      </div>
    </div>
  );
}
