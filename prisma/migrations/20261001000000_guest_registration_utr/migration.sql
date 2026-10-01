-- AlterTable
ALTER TABLE "Tournament" ADD COLUMN     "paymentUpiId" TEXT,
ADD COLUMN     "paymentQrUrl" TEXT,
ADD COLUMN     "allowGuestRegistration" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Registration" ADD COLUMN     "utrNumber" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isGuest" BOOLEAN NOT NULL DEFAULT false;
