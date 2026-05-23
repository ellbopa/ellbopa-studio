import { WorkStatus } from "@prisma/client";
import { unstable_noStore as noStore } from "next/cache";
import { promises as fs } from "node:fs";
import path from "node:path";

export type LocalOrder = {
  id: string;
  userId: string;
  productId?: string | null;
  product?: { title: string } | null;
  serviceType?: string | null;
  status: WorkStatus;
  totalAmount: number;
  depositAmount: number;
  paidAmount: number;
  notes?: string | null;
  referenceArtist?: string | null;
  bpm?: number | null;
  musicalKey?: string | null;
  genre?: string | null;
  filesUrl?: string | null;
  finalFilesUrl?: string | null;
  createdAt: string;
};

export type LocalBooking = {
  id: string;
  userId: string;
  serviceType: string;
  date: string;
  time: string;
  status: WorkStatus;
  depositRequired: number;
  depositPaid: number;
  notes?: string | null;
  createdAt: string;
};

export type LocalPayment = {
  id: string;
  userId: string;
  orderId?: string | null;
  bookingId?: string | null;
  stripeSessionId: string;
  amount: number;
  status: WorkStatus;
  receiptUrl?: string | null;
  createdAt: string;
};

const ordersPath = path.join(process.cwd(), "data", "orders.json");
const bookingsPath = path.join(process.cwd(), "data", "bookings.json");
const paymentsPath = path.join(process.cwd(), "data", "payments.json");

async function readJson<T>(filePath: string): Promise<T[]> {
  noStore();
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

async function writeJson<T extends { id: string }>(filePath: string, item: T) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const current = await readJson<T>(filePath);
  await fs.writeFile(filePath, JSON.stringify([item, ...current.filter((entry) => entry.id !== item.id)], null, 2), "utf8");
}

function localId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function getLocalOrders(userId?: string) {
  const orders = await readJson<LocalOrder>(ordersPath);
  return userId ? orders.filter((order) => order.userId === userId) : orders;
}

export async function saveLocalOrder(order: Omit<LocalOrder, "id" | "createdAt" | "status" | "paidAmount"> & Partial<Pick<LocalOrder, "id" | "createdAt" | "status" | "paidAmount">>) {
  const item: LocalOrder = {
    id: order.id ?? localId("order"),
    createdAt: order.createdAt ?? new Date().toISOString(),
    status: order.status ?? WorkStatus.PENDING,
    paidAmount: order.paidAmount ?? 0,
    ...order
  };
  await writeJson(ordersPath, item);
  return item;
}

export async function updateLocalOrder(id: string, data: Partial<LocalOrder>) {
  const current = await readJson<LocalOrder>(ordersPath);
  const next = current.map((order) => (order.id === id ? { ...order, ...data } : order));
  await fs.mkdir(path.dirname(ordersPath), { recursive: true });
  await fs.writeFile(ordersPath, JSON.stringify(next, null, 2), "utf8");
}

export async function getLocalBookings(userId?: string) {
  const bookings = await readJson<LocalBooking>(bookingsPath);
  return userId ? bookings.filter((booking) => booking.userId === userId) : bookings;
}

export async function saveLocalBooking(booking: Omit<LocalBooking, "id" | "createdAt" | "status" | "depositPaid"> & Partial<Pick<LocalBooking, "id" | "createdAt" | "status" | "depositPaid">>) {
  const item: LocalBooking = {
    id: booking.id ?? localId("booking"),
    createdAt: booking.createdAt ?? new Date().toISOString(),
    status: booking.status ?? WorkStatus.PENDING,
    depositPaid: booking.depositPaid ?? 0,
    ...booking
  };
  await writeJson(bookingsPath, item);
  return item;
}

export async function updateLocalBooking(id: string, data: Partial<LocalBooking>) {
  const current = await readJson<LocalBooking>(bookingsPath);
  const next = current.map((booking) => (booking.id === id ? { ...booking, ...data } : booking));
  await fs.mkdir(path.dirname(bookingsPath), { recursive: true });
  await fs.writeFile(bookingsPath, JSON.stringify(next, null, 2), "utf8");
}

export async function getLocalPayments(userId?: string) {
  const payments = await readJson<LocalPayment>(paymentsPath);
  return userId ? payments.filter((payment) => payment.userId === userId) : payments;
}

export async function saveLocalPayment(payment: Omit<LocalPayment, "id" | "createdAt" | "status" | "stripeSessionId"> & Partial<Pick<LocalPayment, "id" | "createdAt" | "status" | "stripeSessionId">>) {
  const item: LocalPayment = {
    id: payment.id ?? localId("payment"),
    createdAt: payment.createdAt ?? new Date().toISOString(),
    status: payment.status ?? WorkStatus.PENDING,
    stripeSessionId: payment.stripeSessionId ?? `manual-${Date.now()}`,
    ...payment
  };
  await writeJson(paymentsPath, item);
  return item;
}

export async function updateLocalPayment(stripeSessionId: string, data: Partial<LocalPayment>) {
  const current = await readJson<LocalPayment>(paymentsPath);
  const next = current.map((payment) => (payment.stripeSessionId === stripeSessionId ? { ...payment, ...data } : payment));
  await fs.mkdir(path.dirname(paymentsPath), { recursive: true });
  await fs.writeFile(paymentsPath, JSON.stringify(next, null, 2), "utf8");
}
