"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Edit3, Eye, Loader2, Trash2 } from "lucide-react";
import { musicalKeyOptions } from "@/lib/music-keys";
import { formatDop } from "@/lib/format";

type ProductRow = {
  id: string;
  title: string;
  type: string;
  genre?: string | null;
  bpm?: number | null;
  musicalKey?: string | null;
  mood?: string | null;
  description: string;
  price: number;
  premiumPrice?: number | null;
  exclusivePrice?: number | null;
  audioUrl?: string | null;
  imageUrl?: string | null;
  active: boolean;
  createdAt: string | Date;
  _count?: { orders?: number; favorites?: number };
};

export function MyProductsManager({ initialProducts }: { initialProducts: ProductRow[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const activeProducts = useMemo(() => products.filter((product) => product.active), [products]);

  async function archiveProduct(id: string) {
    if (!confirm("Quieres archivar este producto? No se mostrara en marketplace, pero las compras historicas se mantienen.")) return;
    setBusyId(id);
    const res = await fetch(`/api/my/products/${encodeURIComponent(id)}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.product) setProducts((current) => current.map((product) => product.id === id ? data.product : product));
    else alert(data.error || "No se pudo archivar.");
    setBusyId(null);
  }

  async function saveProduct(event: React.FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    setBusyId(id);
    const form = new FormData(event.currentTarget);
    const payload = {
      title: String(form.get("title") ?? ""),
      type: String(form.get("type") ?? "BEAT"),
      genre: String(form.get("genre") ?? ""),
      bpm: Number(form.get("bpm") || 0) || null,
      musicalKey: String(form.get("musicalKey") ?? ""),
      mood: String(form.get("mood") ?? ""),
      description: String(form.get("description") ?? ""),
      price: Number(form.get("price") || 0),
      premiumPrice: Number(form.get("premiumPrice") || 0) || null,
      exclusivePrice: Number(form.get("exclusivePrice") || 0) || null,
      imageUrl: String(form.get("imageUrl") ?? ""),
      audioUrl: String(form.get("audioUrl") ?? "")
    };
    const res = await fetch(`/api/my/products/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.product) {
      setProducts((current) => current.map((product) => product.id === id ? data.product : product));
      setEditingId(null);
    } else {
      alert(data.error || "No se pudo guardar.");
    }
    setBusyId(null);
  }

  if (!activeProducts.length) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-8 text-center">
        <h2 className="font-display text-3xl font-black">Todavia no tienes productos activos</h2>
        <p className="mt-3 text-white/55">Sube tu primer beat, preset, sound kit o servicio. Publicar y vender en Ellbopa Studio es gratis.</p>
        <Link href="/dashboard/producer/upload" className="mt-6 inline-flex rounded-xl bg-studio-red px-5 py-3 text-sm font-black text-white glow-button">Subir producto</Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {activeProducts.map((product) => (
        <article key={product.id} className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
          <div className="grid gap-4 lg:grid-cols-[86px_1fr_auto] lg:items-center">
            <div className="relative aspect-square overflow-hidden rounded-xl bg-black/40">
              <Image src={product.imageUrl || "/images/beat-cover.svg"} alt={product.title} fill sizes="86px" className="object-cover" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate font-display text-2xl font-black">{product.title}</h3>
                <span className="rounded-full border border-white/10 px-2 py-1 text-xs font-black text-white/55">{product.type}</span>
                <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-xs font-black text-emerald-300">Activo</span>
              </div>
              <p className="mt-2 text-sm text-white/52">{product.genre || "Genero"} / {product.bpm || "--"} BPM / {product.musicalKey || "Sin tono"}</p>
              <p className="mt-1 text-sm text-white/38">{product._count?.orders || 0} ventas / {product._count?.favorites || 0} favoritos / {formatDop(product.price)}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href={`/producto/${encodeURIComponent(product.id)}`} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm font-bold text-white/70"><Eye className="h-4 w-4" /> Ver</Link>
              <button onClick={() => setEditingId(editingId === product.id ? null : product.id)} className="inline-flex items-center gap-2 rounded-xl border border-studio-gold/30 px-3 py-2 text-sm font-bold text-studio-gold"><Edit3 className="h-4 w-4" /> Editar</button>
              <button disabled={busyId === product.id} onClick={() => archiveProduct(product.id)} className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 px-3 py-2 text-sm font-bold text-red-200 disabled:opacity-50">
                {busyId === product.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Eliminar
              </button>
            </div>
          </div>

          {editingId === product.id ? (
            <form onSubmit={(event) => saveProduct(event, product.id)} className="mt-5 grid gap-4 border-t border-white/10 pt-5 md:grid-cols-3">
              <Field name="title" label="Titulo" defaultValue={product.title} />
              <Select name="type" label="Tipo" defaultValue={product.type} options={["BEAT", "PRESET", "SOUND_KIT", "SERVICE"]} />
              <Field name="genre" label="Genero" defaultValue={product.genre || ""} />
              <Field name="bpm" label="BPM" type="number" defaultValue={product.bpm || ""} />
              <label className="field">
                Tono / Key
                <select name="musicalKey" className="control" defaultValue={product.musicalKey || ""}>
                  {musicalKeyOptions.map((option) => <option key={option.value || "empty"} value={option.value}>{option.label}</option>)}
                </select>
              </label>
              <Field name="mood" label="Mood" defaultValue={product.mood || ""} />
              <Field name="price" label="Basic RD$" type="number" defaultValue={product.price} />
              <Field name="premiumPrice" label="Premium RD$" type="number" defaultValue={product.premiumPrice || ""} />
              <Field name="exclusivePrice" label="Exclusive RD$" type="number" defaultValue={product.exclusivePrice || ""} />
              <Field name="imageUrl" label="Cover URL" defaultValue={product.imageUrl || ""} />
              <Field name="audioUrl" label="Preview URL" defaultValue={product.audioUrl || ""} />
              <label className="field md:col-span-3">
                Descripcion
                <textarea name="description" rows={4} className="control" defaultValue={product.description} />
              </label>
              <div className="md:col-span-3">
                <button disabled={busyId === product.id} className="rounded-xl bg-studio-red px-5 py-3 text-sm font-black text-white glow-button disabled:opacity-50">
                  {busyId === product.id ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </form>
          ) : null}
        </article>
      ))}
    </div>
  );
}

function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, ...rest } = props;
  return <label className="field">{label}<input {...rest} className="control" /></label>;
}

function Select({ label, name, defaultValue, options }: { label: string; name: string; defaultValue: string; options: string[] }) {
  return (
    <label className="field">
      {label}
      <select name={name} defaultValue={defaultValue} className="control">
        {options.map((option) => <option key={option} value={option}>{option.replace("_", " ")}</option>)}
      </select>
    </label>
  );
}
