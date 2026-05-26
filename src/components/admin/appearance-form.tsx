"use client";

import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import { Check, Palette, Sparkles } from "lucide-react";

const presets = [
  ["Rojo", "#ff1f1f"],
  ["Morado", "#9b5cff"],
  ["Azul", "#2f80ff"],
  ["Verde", "#22c55e"],
  ["Dorado", "#d9a441"],
  ["Blanco", "#f5f5f5"]
] as const;

type AppearanceFormProps = {
  initialColor: string;
  saved?: boolean;
};

export function AppearanceForm({ initialColor, saved = false }: AppearanceFormProps) {
  const [color, setColor] = useState(initialColor || "#ff1f1f");
  const themeStyle = useMemo(
    () =>
      ({
        "--brand-primary": color,
        "--cms-red": color,
        "--color-studio-red": hexToRgb(color),
        "--brand-primary-hover": `color-mix(in srgb, ${color} 82%, white)`,
        "--brand-glow": `color-mix(in srgb, ${color} 36%, transparent)`,
        "--brand-border": `color-mix(in srgb, ${color} 42%, transparent)`,
        "--brand-gradient": `linear-gradient(135deg, ${color}, color-mix(in srgb, ${color} 48%, #d9a441))`
      }) as CSSProperties,
    [color]
  );

  return (
    <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]" style={themeStyle}>
      <form action="/api/admin/appearance" method="POST" className="panel p-6">
        <div className="flex items-center gap-3">
          <div className="grid size-12 place-items-center rounded-2xl bg-studio-red shadow-glow">
            <Palette className="size-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-white/45">Apariencia / Tema</p>
            <h1 className="font-display text-3xl font-black">Color principal</h1>
          </div>
        </div>

        {saved ? (
          <div className="mt-5 flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-sm font-bold text-emerald-100">
            <Check className="size-4" /> Tema guardado y aplicado globalmente.
          </div>
        ) : null}

        <label className="field mt-6">
          Color personalizado
          <input
            name="primaryColor"
            type="color"
            value={color}
            onChange={(event) => setColor(event.target.value)}
            className="mt-3 h-16 w-full cursor-pointer rounded-2xl border border-white/10 bg-black p-2"
          />
        </label>

        <div className="mt-6">
          <p className="text-sm font-bold text-white/70">Presets rapidos</p>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {presets.map(([label, presetColor]) => (
              <button
                type="button"
                key={presetColor}
                onClick={() => setColor(presetColor)}
                className={`cursor-pointer rounded-2xl border bg-black/35 p-3 text-left transition hover:border-[var(--brand-border)] ${color.toLowerCase() === presetColor.toLowerCase() ? "border-[var(--brand-border)] shadow-[0_0_24px_var(--brand-glow)]" : "border-white/10"}`}
              >
                <span className="flex items-center gap-3">
                  <span className="size-8 rounded-full border border-white/20" style={{ backgroundColor: presetColor }} />
                  <span className="font-bold">{label}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        <button className="mt-7 w-full rounded-xl bg-studio-red px-5 py-4 font-black text-white shadow-[0_0_34px_var(--brand-glow)] transition hover:scale-[1.01]">
          Guardar apariencia
        </button>
      </form>

      <section className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.035] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.38)] backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.24em] text-studio-red">Vista previa en vivo</p>
        <h2 className="mt-3 font-display text-5xl font-black uppercase leading-none">
          Tu proximo hit
          <span className="block text-studio-red">empieza aqui</span>
        </h2>
        <p className="mt-4 max-w-2xl text-white/58">Este color controla botones, bordes, highlights, links, badges, glow, gradientes y estados hover.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[var(--brand-border)] bg-black/40 p-4">
            <p className="text-sm text-white/45">Boton</p>
            <button className="mt-4 rounded-xl bg-studio-red px-5 py-3 font-black text-white glow-button">Comprar</button>
          </div>
          <div className="rounded-2xl border border-[var(--brand-border)] bg-black/40 p-4 shadow-[0_0_34px_var(--brand-glow)]">
            <p className="text-sm text-white/45">Glow</p>
            <p className="mt-4 font-display text-3xl font-black text-studio-red">Premium</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
            <p className="text-sm text-white/45">Wave</p>
            <div className="mt-5 flex h-20 items-end gap-1">
              {Array.from({ length: 18 }).map((_, index) => (
                <span key={index} className="flex-1 rounded-full theme-gradient" style={{ height: `${25 + ((index * 19) % 70)}%` }} />
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6 rounded-3xl border border-[var(--brand-border)] brand-soft-surface p-5">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-studio-red text-white shadow-glow">
              <Sparkles className="size-5" />
            </span>
            <div>
              <p className="font-display text-2xl font-black">Marketplace Ellbopa</p>
              <p className="text-sm text-white/50">Identidad actualizada sin tocar codigo.</p>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}

function hexToRgb(value: string) {
  const match = value.trim().match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!match) return "255 31 31";
  const [, r, g, b] = match;
  return `${parseInt(r, 16)} ${parseInt(g, 16)} ${parseInt(b, 16)}`;
}
