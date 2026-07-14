-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "slot1Phantom" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "slot2Phantom" BOOLEAN NOT NULL DEFAULT false;
