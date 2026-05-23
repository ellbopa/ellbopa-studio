type SectionProps = {
  eyebrow?: string;
  title: string;
  children: React.ReactNode;
};

export function Section({ eyebrow, title, children }: SectionProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="mb-8 max-w-3xl">
        {eyebrow ? <p className="mb-3 text-sm font-bold uppercase tracking-[0.22em] text-studio-gold">{eyebrow}</p> : null}
        <h2 className="font-display text-3xl font-black sm:text-5xl">{title}</h2>
      </div>
      {children}
    </section>
  );
}
