"use client";

import Image from "next/image";
import { useState } from "react";
import { CheckCircle2, Loader2, Upload } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing";

type SettingsFormProps = {
  initial: {
    name?: string | null;
    username?: string | null;
    email?: string | null;
    image?: string | null;
    bannerImage?: string | null;
    artistName?: string | null;
    bio?: string | null;
    location?: string | null;
    country?: string | null;
    instagram?: string | null;
    tiktok?: string | null;
    youtube?: string | null;
    spotify?: string | null;
    beatstars?: string | null;
    website?: string | null;
    genres?: string | null;
    specialty?: string | null;
    startingPrice?: number | null;
    availability?: string | null;
    contactLinks?: string | null;
    emailVisible?: boolean | null;
    payoutPaypal?: string | null;
    notificationPrefs?: string | null;
  };
};

export function SettingsProfileForm({ initial }: SettingsFormProps) {
  const [avatar, setAvatar] = useState(initial.image || "");
  const [banner, setBanner] = useState(initial.bannerImage || "");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const avatarUpload = useUploadThing("profileImage", {
    uploadProgressGranularity: "fine",
    onClientUploadComplete: (res) => setAvatar(res?.[0]?.ufsUrl || res?.[0]?.url || ""),
    onUploadError: (error) => setMessage(error.message)
  });
  const bannerUpload = useUploadThing("profileImage", {
    uploadProgressGranularity: "fine",
    onClientUploadComplete: (res) => setBanner(res?.[0]?.ufsUrl || res?.[0]?.url || ""),
    onUploadError: (error) => setMessage(error.message)
  });

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    const res = await fetch("/api/settings/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, image: avatar, bannerImage: banner, emailVisible: form.get("emailVisible") === "on" })
    });
    const data = await res.json().catch(() => ({}));
    setMessage(res.ok ? "Perfil actualizado correctamente." : data.error || "No se pudo guardar.");
    setSaving(false);
  }

  return (
    <form onSubmit={save} className="grid gap-6">
      <section className="rounded-3xl border border-white/10 bg-white/[0.045] p-5">
        <div className="relative h-52 overflow-hidden rounded-2xl bg-black/45">
          {banner ? <Image src={banner} alt="" fill className="object-cover" /> : null}
          <button type="button" onClick={() => pickAndUpload(bannerUpload.startUpload)} disabled={bannerUpload.isUploading} className="absolute bottom-4 right-4 rounded-xl bg-black/70 px-4 py-2 text-sm font-black text-white">
            {bannerUpload.isUploading ? <Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> : <Upload className="mr-2 inline h-4 w-4" />} Banner
          </button>
        </div>
        <div className="-mt-12 flex items-end gap-4 px-4">
          <div className="relative size-28 overflow-hidden rounded-3xl border border-white/20 bg-studio-red shadow-glow">
            <Image src={avatar || "/images/ellbopa-logo.jpeg"} alt="" fill className="object-cover" />
          </div>
          <button type="button" onClick={() => pickAndUpload(avatarUpload.startUpload)} disabled={avatarUpload.isUploading} className="mb-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-black text-white/75">
            {avatarUpload.isUploading ? <Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> : <Upload className="mr-2 inline h-4 w-4" />} Avatar
          </button>
        </div>
      </section>

      <section className="grid gap-4 rounded-3xl border border-white/10 bg-white/[0.045] p-5 md:grid-cols-2">
        <Field name="name" label="Nombre" defaultValue={initial.name || ""} />
        <Field name="username" label="Username unico" defaultValue={initial.username || ""} />
        <Field name="artistName" label="Nombre artistico / marca" defaultValue={initial.artistName || ""} />
        <Field name="location" label="Ubicacion" defaultValue={initial.location || ""} />
        <Field name="country" label="Pais" defaultValue={initial.country || ""} />
        <Field name="genres" label="Generos musicales" defaultValue={initial.genres || ""} />
        <Field name="specialty" label="Especialidad" defaultValue={initial.specialty || ""} placeholder="productor, ingeniero, artista..." />
        <Field name="startingPrice" label="Precio base RD$" type="number" defaultValue={initial.startingPrice || ""} />
        <Field name="availability" label="Disponibilidad" defaultValue={initial.availability || ""} />
        <Field name="contactLinks" label="Links de contacto" defaultValue={initial.contactLinks || ""} />
        <label className="field md:col-span-2">Bio / descripcion<textarea name="bio" rows={4} className="control" defaultValue={initial.bio || ""} /></label>
      </section>

      <section className="grid gap-4 rounded-3xl border border-white/10 bg-white/[0.045] p-5 md:grid-cols-2">
        <Field name="instagram" label="Instagram" defaultValue={initial.instagram || ""} />
        <Field name="tiktok" label="TikTok" defaultValue={initial.tiktok || ""} />
        <Field name="youtube" label="YouTube" defaultValue={initial.youtube || ""} />
        <Field name="spotify" label="Spotify" defaultValue={initial.spotify || ""} />
        <Field name="beatstars" label="BeatStars" defaultValue={initial.beatstars || ""} />
        <Field name="website" label="Sitio web" defaultValue={initial.website || ""} />
      </section>

      <section className="grid gap-4 rounded-3xl border border-white/10 bg-white/[0.045] p-5 md:grid-cols-2">
        <Field name="payoutPaypal" label="PayPal para payouts" defaultValue={initial.payoutPaypal || ""} />
        <Field name="notificationPrefs" label="Preferencias de notificaciones" defaultValue={initial.notificationPrefs || ""} />
        <label className="flex items-center gap-3 text-sm font-bold text-white/75"><input type="checkbox" name="emailVisible" defaultChecked={Boolean(initial.emailVisible)} /> Mostrar email publico</label>
      </section>

      {message ? <p className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.045] px-4 py-3 text-sm font-bold text-white/75"><CheckCircle2 className="h-4 w-4 text-emerald-300" /> {message}</p> : null}
      <button disabled={saving} className="w-fit rounded-xl bg-studio-red px-6 py-3 text-sm font-black text-white glow-button disabled:opacity-50">
        {saving ? "Guardando..." : "Guardar perfil"}
      </button>
    </form>
  );
}

function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, ...rest } = props;
  return <label className="field">{label}<input {...rest} className="control" /></label>;
}

function pickAndUpload(startUpload: (files: File[]) => Promise<unknown>) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp";
  input.onchange = () => {
    const files = Array.from(input.files || []);
    if (files.length) void startUpload(files);
  };
  input.click();
}
