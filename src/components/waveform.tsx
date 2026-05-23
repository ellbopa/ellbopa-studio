const heights = [26, 48, 32, 60, 42, 72, 36, 54, 68, 30, 46, 76, 38, 58, 44, 64, 34, 50, 70, 28, 40, 62];

export function Waveform({ active = false }: { active?: boolean }) {
  return (
    <div className="flex h-20 items-center gap-1 overflow-hidden">
      {heights.map((height, index) => (
        <span
          key={`${height}-${index}`}
          className={`wave-bar ${active ? "wave-bar-active" : ""}`}
          style={{
            height,
            animationDelay: `${index * 0.05}s`
          }}
        />
      ))}
    </div>
  );
}
