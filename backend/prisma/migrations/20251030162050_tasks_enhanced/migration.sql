-- AlterTable
ALTER TABLE "Task" ADD COLUMN "dependencies" TEXT;
ALTER TABLE "Task" ADD COLUMN "startDate" DATETIME;
ALTER TABLE "Task" ADD COLUMN "tags" TEXT;

-- CreateIndex
CREATE INDEX "Task_status_idx" ON "Task"("status");

-- CreateIndex
CREATE INDEX "Task_assignee_idx" ON "Task"("assignee");

-- CreateIndex
CREATE INDEX "Task_projectId_idx" ON "Task"("projectId");

-- CreateIndex
CREATE INDEX "Task_dueDate_idx" ON "Task"("dueDate");
