import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const OWNER_ADMIN_EMAIL = "ellbopamusic@gmail.com";

function normalizeEmail(value?: string) {
  return value?.trim().toLowerCase();
}

function isEmail(value?: string) {
  return Boolean(value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));
}

async function main() {
  const email = normalizeEmail(process.argv[2]);

  if (!isEmail(email)) {
    console.error("Uso: npm run make:admin -- email@dominio.com");
    process.exitCode = 1;
    return;
  }
  if (email !== OWNER_ADMIN_EMAIL) {
    console.error(`Por seguridad solo ${OWNER_ADMIN_EMAIL} puede ser ADMIN en esta plataforma.`);
    process.exitCode = 1;
    return;
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, role: true }
  });

  if (!user) {
    console.error("No existe un usuario con ese email. Registra la cuenta primero y vuelve a correr el comando.");
    process.exitCode = 1;
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      role: "ADMIN",
      accountType: "ADMIN",
      verified: true,
      emailVerified: new Date(),
      onboardingCompleted: true
    }
  });

  console.log(`Usuario promovido a ADMIN: ${user.email}`);
}

main()
  .catch((error) => {
    console.error("No se pudo promover el usuario a ADMIN.");
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
