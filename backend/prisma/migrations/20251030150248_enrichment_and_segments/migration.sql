-- AlterTable
ALTER TABLE "Company" ADD COLUMN "emailValid" BOOLEAN;
ALTER TABLE "Company" ADD COLUMN "emailValidatedAt" DATETIME;
ALTER TABLE "Company" ADD COLUMN "enrichedAt" DATETIME;
ALTER TABLE "Company" ADD COLUMN "normalizedAddress" TEXT;
ALTER TABLE "Company" ADD COLUMN "normalizedName" TEXT;
ALTER TABLE "Company" ADD COLUMN "whatsappDetected" BOOLEAN;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Contact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT,
    "phone" TEXT,
    "name" TEXT NOT NULL,
    "company" TEXT,
    "source" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "tags" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "emailValid" BOOLEAN,
    "emailValidatedAt" DATETIME,
    "validationReason" TEXT,
    "whatsappDetected" BOOLEAN,
    "enrichedAt" DATETIME,
    "optOut" BOOLEAN NOT NULL DEFAULT false,
    "optOutAt" DATETIME,
    "bounceCount" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_Contact" ("company", "createdAt", "email", "id", "metadata", "name", "phone", "source", "status", "tags", "updatedAt") SELECT "company", "createdAt", "email", "id", "metadata", "name", "phone", "source", "status", "tags", "updatedAt" FROM "Contact";
DROP TABLE "Contact";
ALTER TABLE "new_Contact" RENAME TO "Contact";
CREATE INDEX "Contact_email_idx" ON "Contact"("email");
CREATE INDEX "Contact_phone_idx" ON "Contact"("phone");
CREATE INDEX "Contact_source_idx" ON "Contact"("source");
CREATE INDEX "Contact_optOut_idx" ON "Contact"("optOut");
CREATE TABLE "new_Segment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "filters" TEXT NOT NULL,
    "contactCount" INTEGER NOT NULL DEFAULT 0,
    "type" TEXT NOT NULL DEFAULT 'dynamic',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Segment" ("contactCount", "createdAt", "description", "filters", "id", "name", "updatedAt") SELECT "contactCount", "createdAt", "description", "filters", "id", "name", "updatedAt" FROM "Segment";
DROP TABLE "Segment";
ALTER TABLE "new_Segment" RENAME TO "Segment";
CREATE INDEX "Segment_name_idx" ON "Segment"("name");
CREATE INDEX "Segment_type_idx" ON "Segment"("type");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Company_normalizedName_idx" ON "Company"("normalizedName");
