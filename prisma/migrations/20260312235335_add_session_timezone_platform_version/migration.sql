-- AlterTable
ALTER TABLE "User" ADD COLUMN     "timezone" TEXT;

-- AlterTable
ALTER TABLE "UserActivity" ADD COLUMN     "appVersion" TEXT,
ADD COLUMN     "platform" TEXT,
ADD COLUMN     "sessionId" TEXT;

-- CreateIndex
CREATE INDEX "UserActivity_userId_action_createdAt_idx" ON "UserActivity"("userId", "action", "createdAt");
