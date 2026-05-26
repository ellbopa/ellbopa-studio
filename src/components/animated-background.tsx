export function AnimatedBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,var(--brand-glow),transparent_28rem),radial-gradient(circle_at_82%_4%,rgba(217,164,65,.14),transparent_24rem),radial-gradient(circle_at_54%_90%,var(--brand-glow),transparent_30rem),#030303]" />
      <div className="cinematic-grid absolute inset-0 opacity-70" />
      <div className="red-particle-field absolute inset-0" />
      <div className="aurora-orbit absolute left-[-12rem] top-20 h-96 w-96 rounded-full bg-studio-red/20 blur-3xl" />
      <div className="aurora-orbit-delayed absolute bottom-[-10rem] right-[-8rem] h-[30rem] w-[30rem] rounded-full bg-studio-gold/10 blur-3xl" />
      <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_0%,rgba(255,255,255,.03)_44%,transparent_55%)] opacity-70" />
      <div className="film-grain absolute inset-0 opacity-[0.12]" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/75 to-transparent" />
    </div>
  );
}
