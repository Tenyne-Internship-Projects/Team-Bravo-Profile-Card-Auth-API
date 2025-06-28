/*
  Warnings:

  - You are about to drop the column `email_otp` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "email_otp",
ADD COLUMN     "email_otp_hash" TEXT;
