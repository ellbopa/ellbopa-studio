export default function Loading() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="text-center">
        <div className="mx-auto h-14 w-14 animate-spin rounded-full border-2 border-white/10 border-t-studio-red shadow-glow" />
        <p className="mt-4 text-sm uppercase tracking-[0.24em] text-studio-gold">Cargando Ellbopa</p>
      </div>
    </div>
  );
}
