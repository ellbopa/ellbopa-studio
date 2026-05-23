"use client";

import { useEffect, useState } from "react";

export function PremiumCursor() {
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState({ x: -120, y: -120 });
  const [active, setActive] = useState(false);

  useEffect(() => {
    setMounted(true);
    const move = (event: PointerEvent) => {
      setPosition({ x: event.clientX, y: event.clientY });
    };

    const over = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      setActive(Boolean(target?.closest("a, button, input, textarea, select, [role='button']")));
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerover", over);

    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div
      aria-hidden
      className={`premium-cursor ${active ? "premium-cursor-active" : ""}`}
      style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }}
    />
  );
}
