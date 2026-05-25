import { unstable_noStore as noStore } from "next/cache";
import { promises as fs } from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import type { EllbopaRole } from "@/types/next-auth";

export type LocalUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  phone?: string | null;
  role: EllbopaRole;
  verified: boolean;
  onboardingCompleted: boolean;
  createdAt: string;
};

const usersPath = path.join(process.cwd(), "data", "users.json");

export async function getLocalUsers() {
  noStore();
  try {
    const raw = await fs.readFile(usersPath, "utf8");
    return JSON.parse(raw) as LocalUser[];
  } catch {
    return [];
  }
}

export async function findLocalUserByEmail(email: string) {
  const users = await getLocalUsers();
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export async function saveLocalUser(input: {
  name: string;
  email: string;
  phone?: string | null;
  password: string;
  role?: EllbopaRole;
}) {
  await fs.mkdir(path.dirname(usersPath), { recursive: true });
  const users = await getLocalUsers();
  const existing = users.find((user) => user.email.toLowerCase() === input.email.toLowerCase());
  if (existing) throw new Error("email_exists");

  const user: LocalUser = {
    id: `local-user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: input.name,
    email: input.email.toLowerCase(),
    phone: input.phone ?? null,
    passwordHash: await bcrypt.hash(input.password, 10),
    role: input.role ?? "ARTIST",
    verified: true,
    onboardingCompleted: false,
    createdAt: new Date().toISOString()
  };

  await fs.writeFile(usersPath, JSON.stringify([user, ...users], null, 2), "utf8");
  return user;
}

export async function updateLocalUserRole(userId: string, role: EllbopaRole) {
  await fs.mkdir(path.dirname(usersPath), { recursive: true });
  const users = await getLocalUsers();
  const next = users.map((user) => user.id === userId ? { ...user, role, onboardingCompleted: true } : user);
  await fs.writeFile(usersPath, JSON.stringify(next, null, 2), "utf8");
}
