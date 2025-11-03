-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SeoPage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "metaDescription" TEXT,
    "slug" TEXT NOT NULL,
    "h1" TEXT NOT NULL,
    "h2s" TEXT,
    "content" TEXT NOT NULL,
    "keywords" TEXT,
    "contentType" TEXT NOT NULL DEFAULT 'article',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "wordCount" INTEGER,
    "readabilityScore" INTEGER,
    "uploadedToSite" BOOLEAN NOT NULL DEFAULT false,
    "uploadedAt" DATETIME,
    "googleSubmitted" BOOLEAN NOT NULL DEFAULT false,
    "googleSubmittedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_SeoPage" ("content", "contentType", "createdAt", "h1", "h2s", "id", "keywords", "metaDescription", "readabilityScore", "slug", "status", "title", "updatedAt", "wordCount") SELECT "content", "contentType", "createdAt", "h1", "h2s", "id", "keywords", "metaDescription", "readabilityScore", "slug", "status", "title", "updatedAt", "wordCount" FROM "SeoPage";
DROP TABLE "SeoPage";
ALTER TABLE "new_SeoPage" RENAME TO "SeoPage";
CREATE UNIQUE INDEX "SeoPage_slug_key" ON "SeoPage"("slug");
CREATE INDEX "SeoPage_slug_idx" ON "SeoPage"("slug");
CREATE INDEX "SeoPage_status_idx" ON "SeoPage"("status");
CREATE INDEX "SeoPage_contentType_idx" ON "SeoPage"("contentType");
CREATE INDEX "SeoPage_uploadedToSite_idx" ON "SeoPage"("uploadedToSite");
CREATE INDEX "SeoPage_googleSubmitted_idx" ON "SeoPage"("googleSubmitted");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
