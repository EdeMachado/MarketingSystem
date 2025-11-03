-- CreateTable
CREATE TABLE "SeoPage" (
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "SeoPage_slug_key" ON "SeoPage"("slug");

-- CreateIndex
CREATE INDEX "SeoPage_slug_idx" ON "SeoPage"("slug");

-- CreateIndex
CREATE INDEX "SeoPage_status_idx" ON "SeoPage"("status");

-- CreateIndex
CREATE INDEX "SeoPage_contentType_idx" ON "SeoPage"("contentType");
