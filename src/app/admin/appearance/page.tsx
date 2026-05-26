import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { isAdminUser } from "@/lib/admin";
import { getSiteConfig } from "@/lib/site-config";
import { AppearanceForm } from "@/components/admin/appearance-form";

export const metadata = { title: "Apariencia | Admin Ellbopa" };

export default async function AdminAppearancePage({ searchParams }: { searchParams?: Promise<{ saved?: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/cliente/login");
  if (!isAdminUser(session.user)) redirect("/");

  const [config, params] = await Promise.all([
    getSiteConfig(),
    (searchParams ?? Promise.resolve({})) as Promise<{ saved?: string }>
  ]);

  return (
    <main className="min-h-screen bg-[#030303] px-4 py-8 text-white sm:px-6 lg:px-10">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_0%,var(--brand-glow),transparent_30rem),linear-gradient(180deg,#050505,#090202)]" />
      <div className="mx-auto max-w-6xl">
        <a href="/admin" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-bold text-white/70 transition hover:border-[var(--brand-border)] hover:text-white">
          <ArrowLeft className="size-4" /> Volver al admin
        </a>

        <div className="mt-6">
          <AppearanceForm initialColor={config.primaryColor || "#ff1f1f"} saved={Boolean(params.saved)} />
        </div>
      </div>
    </main>
  );
}
