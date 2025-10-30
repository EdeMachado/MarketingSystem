-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Advertisement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "company" TEXT NOT NULL DEFAULT 'biomed',
    "title" TEXT NOT NULL,
    "brief" TEXT,
    "objective" TEXT,
    "targetAudience" TEXT,
    "budget" REAL,
    "budgetSpent" REAL DEFAULT 0,
    "content" TEXT,
    "mediaUrls" TEXT,
    "channels" TEXT,
    "channel" TEXT,
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
INSERT INTO "new_Advertisement" ("approvedAt", "approvedBy", "assetId", "brief", "budget", "budgetSpent", "campaignId", "channel", "company", "content", "createdAt", "format", "id", "mediaUrls", "needsApproval", "objective", "publishedAt", "publishedUrl", "scheduledAt", "scheduledChannel", "stage", "status", "targetAudience", "title", "updatedAt") SELECT "approvedAt", "approvedBy", "assetId", "brief", "budget", "budgetSpent", "campaignId", "channel", "company", "content", "createdAt", "format", "id", "mediaUrls", "needsApproval", "objective", "publishedAt", "publishedUrl", "scheduledAt", "scheduledChannel", "stage", "status", "targetAudience", "title", "updatedAt" FROM "Advertisement";
DROP TABLE "Advertisement";
ALTER TABLE "new_Advertisement" RENAME TO "Advertisement";
CREATE INDEX "Advertisement_status_idx" ON "Advertisement"("status");
CREATE INDEX "Advertisement_stage_idx" ON "Advertisement"("stage");
CREATE INDEX "Advertisement_channel_idx" ON "Advertisement"("channel");
CREATE INDEX "Advertisement_company_idx" ON "Advertisement"("company");
CREATE INDEX "Advertisement_scheduledAt_idx" ON "Advertisement"("scheduledAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
