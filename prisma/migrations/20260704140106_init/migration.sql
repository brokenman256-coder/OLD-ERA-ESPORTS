-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'PLAYER',
    "firmName" TEXT,
    "phone" TEXT,
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Tournament" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "game" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "rules" TEXT,
    "prizePool" TEXT,
    "entryFee" REAL NOT NULL DEFAULT 0,
    "hostingFee" REAL NOT NULL DEFAULT 0,
    "maxSlots" INTEGER,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "organizerId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewNote" TEXT,
    "hostingFeeProof" TEXT,
    "hostingFeeVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Tournament_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Registration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tournamentId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "teamName" TEXT,
    "paymentProof" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Registration_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Registration_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Registration_tournamentId_playerId_key" ON "Registration"("tournamentId", "playerId");
