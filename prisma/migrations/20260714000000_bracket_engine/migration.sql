-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "bracket" TEXT NOT NULL DEFAULT 'MAIN',
    "round" INTEGER NOT NULL,
    "slot" INTEGER NOT NULL,
    "registration1Id" TEXT,
    "registration2Id" TEXT,
    "score1" INTEGER,
    "score2" INTEGER,
    "winnerRegistrationId" TEXT,
    "isBye" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "nextMatchId" TEXT,
    "nextMatchSlot" INTEGER,
    "loserNextMatchId" TEXT,
    "loserNextMatchSlot" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Match_tournamentId_bracket_round_slot_key" ON "Match"("tournamentId", "bracket", "round", "slot");

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_registration1Id_fkey" FOREIGN KEY ("registration1Id") REFERENCES "Registration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_registration2Id_fkey" FOREIGN KEY ("registration2Id") REFERENCES "Registration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_winnerRegistrationId_fkey" FOREIGN KEY ("winnerRegistrationId") REFERENCES "Registration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

