import { NextResponse } from "next/server";
import JSZip from "jszip";
import { promises as fs } from "node:fs";
import path from "node:path";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLocalOrders } from "@/lib/local-workflow";
import { isOrderPaid, parseDownloadLinks } from "@/lib/download-links";
import { formatDop } from "@/lib/format";

type DownloadOrder = {
  id: string;
  userId: string;
  productId?: string | null;
  user?: { name?: string | null; email?: string | null } | null;
  product?: { title?: string | null; type?: string | null; fileUrl?: string | null; owner?: { name?: string | null; email?: string | null } | null } | null;
  payments?: Array<{ status: string; amount: number; createdAt?: Date | string }>;
  serviceType?: string | null;
  status: string;
  totalAmount: number;
  paidAmount: number;
  notes?: string | null;
  finalFilesUrl?: string | null;
  createdAt?: Date | string;
};

export async function GET(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  const [{ orderId }, session] = await Promise.all([params, auth()]);
  if (!session?.user?.id) return NextResponse.redirect(new URL(`/login?next=descargas&orderId=${encodeURIComponent(orderId)}`, request.url));

  const order = await loadOrder(orderId);
  const paymentIsPaid = order?.payments?.some((payment) => payment.status === "PAID") || Number(order?.paidAmount || 0) >= Number(order?.totalAmount || 0);
  if (!order || order.userId !== session.user.id || !isOrderPaid(order) || !paymentIsPaid) {
    return NextResponse.json({ error: "Download not available" }, { status: 403 });
  }

  const downloadSource = order.finalFilesUrl || (order.product?.fileUrl ? `${order.product.title ?? "Archivo"}: ${order.product.fileUrl}` : "");
  if (order.productId && !downloadSource) return NextResponse.json({ error: "Product has no file available" }, { status: 404 });

  const index = Number(new URL(request.url).searchParams.get("i") ?? 0);
  const link = parseDownloadLinks(downloadSource)[index];
  if (!link) return NextResponse.json({ error: "File not found" }, { status: 404 });

  const file = await readProtectedFile(link.url);
  if (!file) return NextResponse.json({ error: "File unavailable" }, { status: 404 });

  const zip = new JSZip();
  const productName = order.product?.title || link.title || order.serviceType || "producto-ellbopa";
  const licenseType = extractLicense(order);
  const mainFileName = packageFileName(productName, link.url, file.contentType);
  zip.file(mainFileName, file.bytes);
  zip.file("LICENSE.txt", buildLicenseText(order, productName, licenseType));

  try {
    const zipBytes = await zip.generateAsync({ type: "uint8array", compression: "DEFLATE" });
    const zipName = `ellbopa-${slugify(productName)}-${slugify(licenseType)}-${slugify(order.id)}.zip`;
    return new NextResponse(Buffer.from(zipBytes), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${zipName}"`,
        "Cache-Control": "private, no-store"
      }
    });
  } catch (error) {
    console.error("[api-download][zip]", error);
    return NextResponse.json({ error: "Could not generate download package" }, { status: 500 });
  }
}

async function readProtectedFile(url: string) {
  if (/^https?:\/\//i.test(url)) {
    try {
      const remote = await fetch(url, { cache: "no-store" });
      if (!remote.ok) return null;
      return {
        bytes: Buffer.from(await remote.arrayBuffer()),
        contentType: remote.headers.get("Content-Type") || "application/octet-stream"
      };
    } catch (error) {
      console.error("[api-download][remote]", error);
      return null;
    }
  }

  const publicRoot = path.join(process.cwd(), "public");
  const filePath = path.normalize(path.join(publicRoot, url.replace(/^\/+/, "")));
  if (!filePath.startsWith(publicRoot)) return null;

  try {
    return {
      bytes: await fs.readFile(filePath),
      contentType: "application/octet-stream"
    };
  } catch {
    return null;
  }
}

async function loadOrder(orderId: string): Promise<DownloadOrder | null> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { name: true, email: true } },
        product: {
          select: {
            title: true,
            type: true,
            fileUrl: true,
            owner: { select: { name: true, email: true } }
          }
        },
        payments: { select: { status: true, amount: true, createdAt: true }, orderBy: { createdAt: "desc" } }
      }
    });
    return order;
  } catch (error) {
    console.error("[api-download][load]", error);
    const order = (await getLocalOrders()).find((item) => item.id === orderId);
    return order ? { ...order, product: null } : null;
  }
}

function packageFileName(productName: string, url: string, contentType?: string) {
  const source = url.split("?")[0].split("/").pop() || "";
  const detectedExtension = detectExtension(contentType);
  const extension = source.includes(".") ? source.slice(source.lastIndexOf(".")).toLowerCase() : detectedExtension || ".zip";
  const preferred = extension === ".mp3" || extension === ".wav" ? `beat${extension}` : `${slugify(productName)}${extension || ".zip"}`;
  return preferred;
}

function detectExtension(contentType?: string) {
  const value = contentType?.toLowerCase() ?? "";
  if (value.includes("audio/mpeg") || value.includes("audio/mp3")) return ".mp3";
  if (value.includes("audio/wav") || value.includes("audio/x-wav") || value.includes("audio/wave")) return ".wav";
  if (value.includes("application/zip") || value.includes("x-zip-compressed")) return ".zip";
  return "";
}

function buildLicenseText(order: DownloadOrder, productName: string, licenseType: string) {
  const paidAt = order.payments?.find((payment) => payment.status === "PAID")?.createdAt ?? order.createdAt ?? new Date();
  const creator = order.product?.owner?.name || order.product?.owner?.email || "Ellbopa Studio";
  const buyerName = order.user?.name || "Cliente Ellbopa";
  const buyerEmail = order.user?.email || "Sin email";
  const terms = licenseTerms(licenseType);

  return [
    "ELLBOPA STUDIO - LICENCIA DE USO DIGITAL",
    "========================================",
    "",
    `Numero de orden: ${order.id}`,
    `Fecha: ${formatDate(paidAt)}`,
    `Comprador: ${buyerName}`,
    `Email comprador: ${buyerEmail}`,
    `Producto: ${productName}`,
    `Productor / Creador: ${creator}`,
    `Tipo de licencia: ${licenseType}`,
    `Monto pagado: ${formatDop(order.paidAmount || order.totalAmount)}`,
    "",
    "Terminos basicos:",
    ...terms.map((term) => `- ${term}`),
    "",
    "Notas:",
    "- Esta licencia acompana el archivo comprado y confirma que el pago fue recibido.",
    "- La reventa, redistribucion o publicacion del archivo instrumental aislado no esta permitida.",
    "- Conserva este archivo como comprobante de compra.",
    "",
    "Ellbopa Studio / Ellbopa Music",
    "Santo Domingo, Republica Dominicana"
  ].join("\n");
}

function extractLicense(order: DownloadOrder) {
  const text = `${order.notes ?? ""}\n${order.serviceType ?? ""}`;
  const match = text.match(/Licencia:\s*([^\n]+)/i);
  if (match?.[1]) return match[1].trim();
  if (/premium/i.test(text)) return "Premium License";
  if (/unlimited|exclusive|exclusiva/i.test(text)) return "Unlimited / Exclusive License";
  if (/basic|basica/i.test(text)) return "Basic License";
  return "Digital License";
}

function licenseTerms(licenseType: string) {
  if (/premium/i.test(licenseType)) {
    return [
      "Licencia no exclusiva.",
      "Incluye mas derechos de distribucion que Basic.",
      "Puede usarse en plataformas digitales y contenido monetizado segun el acuerdo del producto.",
      "No transfiere propiedad del beat."
    ];
  }

  if (/unlimited|exclusive|exclusiva/i.test(licenseType)) {
    return [
      "Licencia de uso amplio segun la configuracion del producto comprado.",
      "Permite mayor distribucion y uso comercial.",
      "Si la licencia es exclusiva, los terminos finales dependen del acuerdo con el creador.",
      "No permite revender el archivo instrumental como producto propio."
    ];
  }

  return [
    "Licencia basica no exclusiva.",
    "Uso limitado para grabacion musical del comprador.",
    "Distribucion limitada segun el acuerdo del producto.",
    "No transfiere propiedad del beat."
  ];
}

function formatDate(date: Date | string) {
  const value = typeof date === "string" ? new Date(date) : date;
  return Number.isNaN(value.getTime()) ? String(date) : value.toLocaleDateString("es-DO");
}

function slugify(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "download";
}
