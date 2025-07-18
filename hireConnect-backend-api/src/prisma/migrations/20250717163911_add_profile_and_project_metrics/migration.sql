-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "profileViews" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "budget" INTEGER,
ADD COLUMN     "is_paid" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "profileViews" INTEGER NOT NULL DEFAULT 0;
