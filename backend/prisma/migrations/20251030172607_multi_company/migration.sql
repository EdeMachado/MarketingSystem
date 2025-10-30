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
INSERT INTO "new_Advertisement" ("approvedAt", "approvedBy", "assetId", "brief", "budget", "budgetSpent", "campaignId", "channel", "content", "createdAt", "format", "id", "mediaUrls", "needsApproval", "objective", "publishedAt", "publishedUrl", "scheduledAt", "scheduledChannel", "stage", "status", "targetAudience", "title", "updatedAt") SELECT "approvedAt", "approvedBy", "assetId", "brief", "budget", "budgetSpent", "campaignId", "channel", "content", "createdAt", "format", "id", "mediaUrls", "needsApproval", "objective", "publishedAt", "publishedUrl", "scheduledAt", "scheduledChannel", "stage", "status", "targetAudience", "title", "updatedAt" FROM "Advertisement";
DROP TABLE "Advertisement";
ALTER TABLE "new_Advertisement" RENAME TO "Advertisement";
CREATE INDEX "Advertisement_status_idx" ON "Advertisement"("status");
CREATE INDEX "Advertisement_stage_idx" ON "Advertisement"("stage");
CREATE INDEX "Advertisement_channel_idx" ON "Advertisement"("channel");
CREATE INDEX "Advertisement_company_idx" ON "Advertisement"("company");
CREATE INDEX "Advertisement_scheduledAt_idx" ON "Advertisement"("scheduledAt");
CREATE TABLE "new_Asset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "company" TEXT NOT NULL DEFAULT 'biomed',
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT,
    "content" TEXT,
    "tags" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Asset" ("content", "createdAt", "id", "name", "tags", "type", "updatedAt", "url") SELECT "content", "createdAt", "id", "name", "tags", "type", "updatedAt", "url" FROM "Asset";
DROP TABLE "Asset";
ALTER TABLE "new_Asset" RENAME TO "Asset";
CREATE INDEX "Asset_company_idx" ON "Asset"("company");
CREATE TABLE "new_Campaign" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "company" TEXT NOT NULL DEFAULT 'biomed',
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "template" TEXT NOT NULL,
    "subject" TEXT,
    "scheduledAt" DATETIME,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurrenceType" TEXT,
    "recurrenceValue" INTEGER,
    "segmentFilters" TEXT,
    "abTestEnabled" BOOLEAN NOT NULL DEFAULT false,
    "abTestVariants" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "budgetPlanned" REAL,
    "budgetSpent" REAL,
    "revenue" REAL,
    "roi" REAL
);
INSERT INTO "new_Campaign" ("abTestEnabled", "abTestVariants", "budgetPlanned", "budgetSpent", "completedAt", "createdAt", "description", "id", "isRecurring", "metadata", "name", "recurrenceType", "recurrenceValue", "revenue", "roi", "scheduledAt", "segmentFilters", "startedAt", "status", "subject", "template", "type", "updatedAt") SELECT "abTestEnabled", "abTestVariants", "budgetPlanned", "budgetSpent", "completedAt", "createdAt", "description", "id", "isRecurring", "metadata", "name", "recurrenceType", "recurrenceValue", "revenue", "roi", "scheduledAt", "segmentFilters", "startedAt", "status", "subject", "template", "type", "updatedAt" FROM "Campaign";
DROP TABLE "Campaign";
ALTER TABLE "new_Campaign" RENAME TO "Campaign";
CREATE INDEX "Campaign_status_idx" ON "Campaign"("status");
CREATE INDEX "Campaign_type_idx" ON "Campaign"("type");
CREATE INDEX "Campaign_company_idx" ON "Campaign"("company");
CREATE INDEX "Campaign_scheduledAt_idx" ON "Campaign"("scheduledAt");
CREATE TABLE "new_Creative" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "company" TEXT NOT NULL DEFAULT 'biomed',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "channel" TEXT NOT NULL,
    "body" TEXT,
    "assetIds" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Creative" ("assetIds", "body", "channel", "createdAt", "description", "id", "status", "title", "updatedAt") SELECT "assetIds", "body", "channel", "createdAt", "description", "id", "status", "title", "updatedAt" FROM "Creative";
DROP TABLE "Creative";
ALTER TABLE "new_Creative" RENAME TO "Creative";
CREATE INDEX "Creative_company_idx" ON "Creative"("company");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
