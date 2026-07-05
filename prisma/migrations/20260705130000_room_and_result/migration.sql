-- AlterTable
ALTER TABLE "Tournament" ADD COLUMN     "roomId" TEXT,
ADD COLUMN     "roomPassword" TEXT;

-- AlterTable
ALTER TABLE "Registration" ADD COLUMN     "resultProof" TEXT;
