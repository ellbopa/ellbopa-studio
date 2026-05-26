-- AlterTable
ALTER TABLE "User" ADD COLUMN     "availability" TEXT,
ADD COLUMN     "bannerImage" TEXT,
ADD COLUMN     "beatstars" TEXT,
ADD COLUMN     "contactLinks" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "emailVisible" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notificationPrefs" TEXT,
ADD COLUMN     "payoutPaypal" TEXT,
ADD COLUMN     "specialty" TEXT,
ADD COLUMN     "website" TEXT;
