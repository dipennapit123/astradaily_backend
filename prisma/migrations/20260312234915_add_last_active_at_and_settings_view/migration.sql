-- AlterEnum
ALTER TYPE "UserActivityAction" ADD VALUE 'SETTINGS_VIEW';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastActiveAt" TIMESTAMP(3);
