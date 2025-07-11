-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "department" TEXT;

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "description" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "logo" TEXT;

-- AlterTable
ALTER TABLE "Recruiter" ADD COLUMN     "description" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "logo" TEXT;
