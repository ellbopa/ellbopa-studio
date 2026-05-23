import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, LockKeyhole } from "lucide-react";

export function RoleDashboard({
  eyebrow,
  title,
  description,
  stats,
  actions,
  sections
}: {
  eyebrow: string;
  title: string;
  description: string;
  stats: Array<{ label: string; value: string | number }>;
  actions: Array<{ label: string; href: string; icon: LucideIcon }>;
  sections: Array<{ title: string; text: string; items: string[] }>;
}) {
  return (
    <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.26em] text-studio-gold">{eyebrow}</p>
          <h1 className="mt-4 font-display text-5xl font-black uppercase leading-[0.92] sm:text-7xl">{title}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/62">{description}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="premium-card rounded-lg p-5">
              <p className="text-sm text-white/50">{stat.label}</p>
              <p className="mt-2 font-display text-3xl font-black text-studio-gold">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-3 md:grid-cols-4">
        {actions.map(({ label, href, icon: Icon }) => (
          <Link key={label} href={href} className="premium-card premium-hover flex items-center justify-between rounded-lg p-4">
            <span className="flex items-center gap-3 font-bold">
              <Icon className="h-5 w-5 text-studio-red" />
              {label}
            </span>
            <ArrowRight className="h-4 w-4 text-white/40" />
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {sections.map((section) => (
          <section key={section.title} className="premium-card rounded-lg p-6">
            <h2 className="font-display text-2xl font-black">{section.title}</h2>
            <p className="mt-2 text-sm leading-6 text-white/55">{section.text}</p>
            <div className="mt-5 space-y-2">
              {section.items.map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-md border border-white/10 bg-black/35 p-3 text-sm text-white/68">
                  <LockKeyhole className="h-4 w-4 text-studio-gold" />
                  {item}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
