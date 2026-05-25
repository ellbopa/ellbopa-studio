import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const ADMIN_EMAIL = "ellbopamusic@gmail.com";
const confirmed = process.argv.includes("--confirm");
const includeNonAdminUsers = process.argv.includes("--include-non-admin-users");

async function main() {
  const counts = await getCounts();
  const admin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL }, select: { id: true, email: true, role: true } });
  console.log(JSON.stringify({ mode: confirmed ? "CLEAN" : "DRY_RUN", counts, adminPreserved: admin }, null, 2));

  if (!confirmed) {
    console.log("\nNo se borro nada. Para limpiar datos beta ejecuta:");
    console.log("npm run clean:beta -- --confirm");
    console.log("\nPara borrar tambien usuarios que NO sean admin:");
    console.log("npm run clean:beta -- --confirm --include-non-admin-users");
    return;
  }

  if (!admin) throw new Error(`No existe el admin ${ADMIN_EMAIL}. Cancelo limpieza para no dejar la plataforma sin admin.`);

  const backupDir = path.join(process.cwd(), "backups");
  await mkdir(backupDir, { recursive: true });
  const backupPath = path.join(backupDir, `beta-clean-backup-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  await writeFile(backupPath, JSON.stringify(await getBackup(), null, 2));
  console.log(`Backup creado: ${backupPath}`);

  await prisma.$transaction(async (tx) => {
    await tx.walletTransaction.deleteMany();
    await tx.payoutRequest.deleteMany();
    await tx.payment.deleteMany();
    await tx.message.deleteMany();
    await tx.order.deleteMany();
    await tx.booking.deleteMany();
    await tx.favorite.deleteMany();
    await tx.follow.deleteMany();
    await tx.review.deleteMany();
    await tx.communityComment.deleteMany();
    await tx.communityPost.deleteMany();
    await tx.productView.deleteMany();
    await tx.license.deleteMany();
    await tx.product.deleteMany();
    await tx.wallet.deleteMany();

    if (includeNonAdminUsers) {
      await tx.passwordResetToken.deleteMany({ where: { user: { email: { not: ADMIN_EMAIL } } } });
      await tx.verificationCode.deleteMany({ where: { user: { email: { not: ADMIN_EMAIL } } } });
      await tx.account.deleteMany({ where: { user: { email: { not: ADMIN_EMAIL } } } });
      await tx.session.deleteMany({ where: { user: { email: { not: ADMIN_EMAIL } } } });
      await tx.artistProfile.deleteMany({ where: { user: { email: { not: ADMIN_EMAIL } } } });
      await tx.producerProfile.deleteMany({ where: { user: { email: { not: ADMIN_EMAIL } } } });
      await tx.engineerProfile.deleteMany({ where: { user: { email: { not: ADMIN_EMAIL } } } });
      await tx.studioProfile.deleteMany({ where: { user: { email: { not: ADMIN_EMAIL } } } });
      await tx.user.deleteMany({ where: { email: { not: ADMIN_EMAIL } } });
    }
  });

  console.log(JSON.stringify({ cleaned: true, counts: await getCounts() }, null, 2));
}

async function getCounts() {
  return {
    users: await prisma.user.count(),
    products: await prisma.product.count(),
    orders: await prisma.order.count(),
    payments: await prisma.payment.count(),
    wallets: await prisma.wallet.count(),
    payouts: await prisma.payoutRequest.count(),
    posts: await prisma.communityPost.count(),
    favorites: await prisma.favorite.count(),
    follows: await prisma.follow.count(),
    reviews: await prisma.review.count()
  };
}

async function getBackup() {
  return {
    createdAt: new Date().toISOString(),
    users: await prisma.user.findMany({ select: { id: true, email: true, role: true, createdAt: true } }),
    products: await prisma.product.findMany(),
    orders: await prisma.order.findMany(),
    payments: await prisma.payment.findMany(),
    wallets: await prisma.wallet.findMany(),
    payouts: await prisma.payoutRequest.findMany(),
    posts: await prisma.communityPost.findMany(),
    favorites: await prisma.favorite.findMany(),
    follows: await prisma.follow.findMany(),
    reviews: await prisma.review.findMany()
  };
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
