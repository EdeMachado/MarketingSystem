-- CreateTable
CREATE TABLE "Advertisement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "brief" TEXT,
    "objective" TEXT,
    "targetAudience" TEXT,
    "budget" REAL,
    "budgetSpent" REAL DEFAULT 0,
    "content" TEXT,
    "mediaUrls" TEXT,
    "channel" TEXT NOT NULL,
    "format" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "stage" TEXT NOT NULL DEFAULT 'planning',
    "needsApproval" BOOLEAN NOT NULL DEFAULT true,
    "approvedAt" DATETIME,
    "approvedBy" TEXT,
    "scheduledAt" DATETIME,
    "scheduledChannel" TEXT,
    "publishedAt" DATETIME,
    "publishedUrl" TEXT,
    "campaignId" TEXT,
    "assetId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Approval" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creativeId" TEXT,
    "advertisementId" TEXT,
    "reviewer" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decidedAt" DATETIME,
    CONSTRAINT "Approval_creativeId_fkey" FOREIGN KEY ("creativeId") REFERENCES "Creative" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Approval_advertisementId_fkey" FOREIGN KEY ("advertisementId") REFERENCES "Advertisement" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Approval" ("comment", "createdAt", "creativeId", "decidedAt", "id", "reviewer", "status") SELECT "comment", "createdAt", "creativeId", "decidedAt", "id", "reviewer", "status" FROM "Approval";
DROP TABLE "Approval";
ALTER TABLE "new_Approval" RENAME TO "Approval";
CREATE INDEX "Approval_creativeId_idx" ON "Approval"("creativeId");
CREATE INDEX "Approval_advertisementId_idx" ON "Approval"("advertisementId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Advertisement_status_idx" ON "Advertisement"("status");

-- CreateIndex
CREATE INDEX "Advertisement_stage_idx" ON "Advertisement"("stage");

-- CreateIndex
CREATE INDEX "Advertisement_channel_idx" ON "Advertisement"("channel");

-- CreateIndex
CREATE INDEX "Advertisement_scheduledAt_idx" ON "Advertisement"("scheduledAt");
