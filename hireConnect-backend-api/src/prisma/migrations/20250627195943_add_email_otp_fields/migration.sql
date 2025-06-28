-- AlterTable
ALTER TABLE "User" ADD COLUMN     "email_otp" TEXT,
ADD COLUMN     "email_otp_expire_at" TIMESTAMP(3);
