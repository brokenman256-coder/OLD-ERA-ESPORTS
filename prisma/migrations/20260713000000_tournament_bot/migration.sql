-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "botEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "botIntervalMinutes" INTEGER NOT NULL DEFAULT 20,
ADD COLUMN     "botLastRunAt" TIMESTAMP(3);
