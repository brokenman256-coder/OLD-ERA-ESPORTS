-- AlterTable
ALTER TABLE "User" ADD COLUMN     "defaultSquad" JSONB,
ADD COLUMN     "organizerUpiId" TEXT,
ADD COLUMN     "organizerQrUrl" TEXT;

-- CreateTable
CREATE TABLE "TournamentSupportMessage" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "fromOrganizer" BOOLEAN NOT NULL DEFAULT false,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TournamentSupportMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TournamentSupportMessage_tournamentId_idx" ON "TournamentSupportMessage"("tournamentId");

-- CreateIndex
CREATE INDEX "TournamentSupportMessage_userId_idx" ON "TournamentSupportMessage"("userId");

-- AddForeignKey
ALTER TABLE "TournamentSupportMessage" ADD CONSTRAINT "TournamentSupportMessage_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentSupportMessage" ADD CONSTRAINT "TournamentSupportMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL,
    "organizerId" TEXT NOT NULL,
    "tournamentId" TEXT,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Announcement_organizerId_idx" ON "Announcement"("organizerId");

-- CreateIndex
CREATE INDEX "Announcement_tournamentId_idx" ON "Announcement"("tournamentId");

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE SET NULL ON UPDATE CASCADE;
