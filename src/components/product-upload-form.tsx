"use client";

import { useRef, useState } from "react";
import { AlertCircle, CheckCircle2, FileArchive, ImageIcon, Loader2, Music2 } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing";

type UploadedAsset = {
  url: string;
  name: string;
  size?: number;
};

type UploadState = "waiting" | "uploading" | "processing" | "done" | "error";

type UploadCardProps = {
  title: string;
  description: string;
  accept: string;
  icon: React.ReactNode;
  asset: UploadedAsset | null;
  disabled?: boolean;
  onPick: (files: File[]) => void;
  state: UploadState;
  progress: number;
  error?: string;
  previewType?: "image" | "audio" | "file";
};

type ProductUploadFormProps = {
  uploadConfigured: boolean;
  returnTo?: "producer" | "engineer" | "admin";
};

const urlFields = [
  { name: "imageUrl", label: "Cover URL", placeholder: "https://.../cover.png" },
  { name: "audioUrl", label: "Preview URL", placeholder: "https://.../preview.mp3" },
  { name: "fileUrl", label: "Archivo final URL", placeholder: "https://.../pack.zip" }
];

export function ProductUploadForm({ uploadConfigured, returnTo = "producer" }: ProductUploadFormProps) {
  const [cover, setCover] = useState<UploadedAsset | null>(null);
  const [preview, setPreview] = useState<UploadedAsset | null>(null);
  const [finalFile, setFinalFile] = useState<UploadedAsset | null>(null);
  const [error, setError] = useState("");
  const [coverState, setCoverState] = useUploadStatus();
  const [previewState, setPreviewState] = useUploadStatus();
  const [fileState, setFileState] = useUploadStatus();

  const isUploading = uploadInFlight(coverState.state) || uploadInFlight(previewState.state) || uploadInFlight(fileState.state);

  const coverUpload = useUploadThing("coverImage", {
    uploadProgressGranularity: "fine",
    onUploadBegin: () => {
      setError("");
      setCoverState({ state: "uploading", progress: 1 });
    },
    onUploadProgress: (progress) => setCoverState({ state: "uploading", progress: Math.max(1, Math.round(progress)) }),
    onClientUploadComplete: (res) => {
      setCoverState({ state: "done", progress: 100 });
      setCover(toAsset(res));
    },
    onUploadError: (event) => {
      setCoverState({ state: "error", progress: 0, error: readableUploadError(event.message) });
      setError(readableUploadError(event.message));
    }
  });
  const previewUpload = useUploadThing("audioPreview", {
    uploadProgressGranularity: "fine",
    onUploadBegin: () => {
      setError("");
      setPreviewState({ state: "uploading", progress: 1 });
    },
    onUploadProgress: (progress) => setPreviewState({ state: "uploading", progress: Math.max(1, Math.round(progress)) }),
    onClientUploadComplete: (res) => {
      setPreviewState({ state: "done", progress: 100 });
      setPreview(toAsset(res));
    },
    onUploadError: (event) => {
      setPreviewState({ state: "error", progress: 0, error: readableUploadError(event.message) });
      setError(readableUploadError(event.message));
    }
  });
  const fileUpload = useUploadThing("productFile", {
    uploadProgressGranularity: "fine",
    onUploadBegin: () => {
      setError("");
      setFileState({ state: "uploading", progress: 1 });
    },
    onUploadProgress: (progress) => setFileState({ state: "uploading", progress: Math.max(1, Math.round(progress)) }),
    onClientUploadComplete: (res) => {
      setFileState({ state: "done", progress: 100 });
      setFinalFile(toAsset(res));
    },
    onUploadError: (event) => {
      setFileState({ state: "error", progress: 0, error: readableUploadError(event.message) });
      setError(readableUploadError(event.message));
    }
  });

  return (
    <form action="/api/admin/upload-product" method="POST" className="grid gap-5">
      <input type="hidden" name="returnTo" value={returnTo} />
      <input type="hidden" name="imageUrl" value={cover?.url ?? ""} />
      <input type="hidden" name="imageName" value={cover?.name ?? ""} />
      <input type="hidden" name="audioUrl" value={preview?.url ?? ""} />
      <input type="hidden" name="audioName" value={preview?.name ?? ""} />
      <input type="hidden" name="fileUrl" value={finalFile?.url ?? ""} />
      <input type="hidden" name="fileName" value={finalFile?.name ?? ""} />

      {!uploadConfigured ? (
        <div className="rounded-lg border border-studio-gold/25 bg-studio-gold/10 p-4 text-sm text-studio-gold">
          Configura <strong>UPLOADTHING_TOKEN</strong> en tu .env para activar subida directa. Mientras tanto puedes pegar URLs remotas abajo para probar.
        </div>
      ) : null}

      {error ? <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</div> : null}

      <div className="grid gap-4 md:grid-cols-3">
        <UploadCard
          title="Cover image"
          description="JPG, PNG o WEBP, maximo 8MB"
          accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
          icon={<ImageIcon className="h-6 w-6" />}
          asset={cover}
          disabled={!uploadConfigured || coverUpload.isUploading}
          state={coverUpload.isUploading ? "uploading" : coverState.state}
          progress={coverState.progress}
          error={coverState.error}
          previewType="image"
          onPick={(files) => startUpload(coverUpload.startUpload, files, setCoverState, setError)}
        />
        <UploadCard
          title="Audio preview"
          description="MP3 o WAV para el player"
          accept="audio/mpeg,audio/wav,audio/x-wav,.mp3,.wav"
          icon={<Music2 className="h-6 w-6" />}
          asset={preview}
          disabled={!uploadConfigured || previewUpload.isUploading}
          state={previewUpload.isUploading ? "uploading" : previewState.state}
          progress={previewState.progress}
          error={previewState.error}
          previewType="audio"
          onPick={(files) => startUpload(previewUpload.startUpload, files, setPreviewState, setError)}
        />
        <UploadCard
          title="Archivo final"
          description="WAV, MP3 o ZIP privado"
          accept="audio/mpeg,audio/wav,audio/x-wav,application/zip,application/x-zip-compressed,.mp3,.wav,.zip"
          icon={<FileArchive className="h-6 w-6" />}
          asset={finalFile}
          disabled={!uploadConfigured || fileUpload.isUploading}
          state={fileUpload.isUploading ? "uploading" : fileState.state}
          progress={fileState.progress}
          error={fileState.error}
          previewType="file"
          onPick={(files) => startUpload(fileUpload.startUpload, files, setFileState, setError)}
        />
      </div>

      {!uploadConfigured ? (
        <div className="grid gap-4 md:grid-cols-3">
          {urlFields.map((field) => (
            <label key={field.name} className="field">
              {field.label}
              <input name={field.name} placeholder={field.placeholder} className="control" />
            </label>
          ))}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <Input name="title" label="Titulo" required />
        <label className="field">
          Tipo
          <select name="type" className="control">
            <option value="BEAT">Beat / Instrumental</option>
            <option value="PRESET">Preset vocal</option>
            <option value="SOUND_KIT">Sound Kit</option>
          </select>
        </label>
        <Input name="genre" label="Genero" placeholder="Trap, R&B, Dembow" />
        <Input name="bpm" label="BPM" type="number" />
        <Input name="musicalKey" label="Key" placeholder="Fm, C#m..." />
        <Input name="mood" label="Mood" placeholder="Dark, luxury, street" />
        <Input name="price" label="Basic RD$" type="number" required />
        <Input name="premiumPrice" label="Premium RD$" type="number" />
        <Input name="exclusivePrice" label="Exclusive RD$" type="number" />
        <label className="field md:col-span-3">
          Descripcion
          <textarea name="description" required rows={4} className="control" />
        </label>
      </div>

      <button disabled={isUploading} className="rounded-md bg-studio-red px-5 py-3 font-black text-white glow-button disabled:cursor-not-allowed disabled:opacity-50">
        {isUploading ? "Espera que termine la subida..." : "Publicar producto"}
      </button>
    </form>
  );
}

function UploadCard({ title, description, accept, icon, asset, disabled, state, progress, error, previewType, onPick }: UploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const statusLabel = {
    waiting: "Esperando archivo",
    uploading: "Subiendo...",
    processing: "Procesando...",
    done: "Listo",
    error: "Error"
  }[state];

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          if (files.length) onPick(files);
          event.target.value = "";
        }}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className="grid min-h-44 w-full place-items-center rounded-lg border border-dashed border-studio-red/35 bg-black/35 text-center transition hover:border-studio-red hover:bg-studio-red/10 disabled:cursor-not-allowed disabled:opacity-45"
      >
        <span className="grid justify-items-center gap-3">
          <span className={`rounded-full p-3 ${state === "done" ? "bg-emerald-400/15 text-emerald-300" : state === "error" ? "bg-red-500/15 text-red-200" : "bg-studio-red/15 text-studio-red"}`}>
            {state === "uploading" || state === "processing" ? <Loader2 className="h-6 w-6 animate-spin" /> : state === "done" ? <CheckCircle2 className="h-6 w-6" /> : state === "error" ? <AlertCircle className="h-6 w-6" /> : icon}
          </span>
          <span className="font-display text-xl font-black">{title}</span>
          <span className="text-xs text-white/45">{description}</span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-white/60">{statusLabel}</span>
        </span>
      </button>
      {state === "uploading" || state === "processing" ? (
        <div className="mt-3">
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-studio-red transition-all" style={{ width: `${Math.min(100, Math.max(1, progress))}%` }} />
          </div>
          <p className="mt-2 text-xs font-bold text-white/50">{Math.round(progress)}%</p>
        </div>
      ) : null}
      {asset ? (
        <div className="mt-3 space-y-3">
          <p className="flex items-center gap-2 truncate text-xs text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span className="truncate">{asset.name}</span>
            {asset.size ? <span className="shrink-0 text-white/35">({formatBytes(asset.size)})</span> : null}
          </p>
          {previewType === "audio" ? <audio controls src={asset.url} className="w-full" preload="metadata" /> : null}
          {previewType === "image" ? (
            <div
              aria-label={asset.name}
              className="h-24 w-full rounded-md bg-cover bg-center"
              style={{ backgroundImage: `url("${asset.url}")` }}
            />
          ) : null}
        </div>
      ) : null}
      {error ? <p className="mt-3 text-xs font-bold text-red-200">{error}</p> : null}
    </div>
  );
}

function Input({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="field">
      {label}
      <input {...props} className="control" />
    </label>
  );
}

function toAsset(res?: Array<{ url?: string; ufsUrl?: string; name?: string; size?: number }>): UploadedAsset | null {
  const file = res?.[0];
  if (!file) return null;
  return { url: file.ufsUrl || file.url || "", name: file.name || "Archivo subido", size: file.size };
}

async function startUpload(
  startUpload: (files: File[]) => Promise<unknown>,
  files: File[],
  setStatus: React.Dispatch<React.SetStateAction<UploadStatus>>,
  setGlobalError: (message: string) => void
) {
  try {
    setStatus({ state: "uploading", progress: 1 });
    await startUpload(files);
  } catch (error) {
    const message = readableUploadError(error instanceof Error ? error.message : "Upload falló");
    setStatus({ state: "error", progress: 0, error: message });
    setGlobalError(message);
  }
}

type UploadStatus = {
  state: UploadState;
  progress: number;
  error?: string;
};

function useUploadStatus(): [UploadStatus, React.Dispatch<React.SetStateAction<UploadStatus>>] {
  return useState<UploadStatus>({ state: "waiting", progress: 0 });
}

function uploadInFlight(state: UploadState) {
  return state === "uploading" || state === "processing";
}

function readableUploadError(message: string) {
  if (/filetype|invalid file|archivo invalido/i.test(message)) return "Formato invalido. Revisa el tipo de archivo permitido.";
  if (/size|too large|file too large/i.test(message)) return "Archivo demasiado pesado para esta subida.";
  return message || "La subida falló. Intenta otra vez.";
}

function formatBytes(value: number) {
  if (!value) return "";
  const units = ["B", "KB", "MB", "GB"];
  let size = value;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return `${size.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`;
}
