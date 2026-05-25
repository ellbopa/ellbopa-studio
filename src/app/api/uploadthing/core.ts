import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@/lib/auth";
import { isConfiguredAdminEmail } from "@/lib/config";
import { canUploadProducts, normalizeRole } from "@/lib/roles";

const f = createUploadthing();

type UploadCandidate = {
  name: string;
  type: string;
};

type UploadKind = "cover" | "preview" | "final";

const uploadRules: Record<UploadKind, { extensions: string[]; mimePrefixes?: string[]; mimeTypes?: string[] }> = {
  cover: {
    extensions: [".jpg", ".jpeg", ".png", ".webp"],
    mimeTypes: ["image/jpeg", "image/png", "image/webp"]
  },
  preview: {
    extensions: [".mp3", ".wav"],
    mimeTypes: ["audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav", "audio/vnd.wave"]
  },
  final: {
    extensions: [".mp3", ".wav", ".zip"],
    mimeTypes: ["audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav", "audio/vnd.wave", "application/zip", "application/x-zip-compressed"],
    mimePrefixes: ["application/octet-stream"]
  }
};

function validateUploadFiles(kind: UploadKind, files: readonly UploadCandidate[]) {
  const rule = uploadRules[kind];

  for (const file of files) {
    const name = file.name.toLowerCase();
    const type = file.type.toLowerCase();
    const hasValidExtension = rule.extensions.some((extension) => name.endsWith(extension));
    const hasValidMime = rule.mimeTypes?.includes(type) || rule.mimePrefixes?.some((prefix) => type.startsWith(prefix));

    if (!hasValidExtension || !hasValidMime) {
      throw new UploadThingError(`Archivo invalido. Permitidos: ${rule.extensions.join(", ")}`);
    }
  }
}

function requireUploader(kind: UploadKind) {
  return async ({ files }: { files: readonly UploadCandidate[] }) => {
    const session = await auth();
    const role = normalizeRole(session?.user?.role);

    if (!session?.user?.id || (!canUploadProducts(role) && !isConfiguredAdminEmail(session.user.email))) {
      throw new UploadThingError("No tienes permiso para subir archivos.");
    }

    validateUploadFiles(kind, files);

    return { userId: session.user.id, role };
  };
}

function completedUpload(file: { name: string; key: string; type: string; size: number; ufsUrl: string; url: string }) {
  return {
    name: file.name,
    key: file.key,
    type: file.type,
    size: file.size,
    url: file.ufsUrl || file.url
  };
}

export const ourFileRouter = {
  coverImage: f({
    image: { maxFileSize: "8MB", maxFileCount: 1 }
  })
    .middleware(requireUploader("cover"))
    .onUploadComplete(({ file }) => completedUpload(file)),

  audioPreview: f({
    audio: { maxFileSize: "128MB", maxFileCount: 1 }
  })
    .middleware(requireUploader("preview"))
    .onUploadComplete(({ file }) => completedUpload(file)),

  productFile: f({
    blob: { maxFileSize: "512MB", maxFileCount: 1 }
  })
    .middleware(requireUploader("final"))
    .onUploadComplete(({ file }) => completedUpload(file))
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
