-- AlterTable
ALTER TABLE "User" ADD COLUMN "emailVerificationCode" TEXT;
ALTER TABLE "User" ADD COLUMN "emailVerificationExpires" DATETIME;
ALTER TABLE "User" ADD COLUMN "newEmail" TEXT;
ALTER TABLE "User" ADD COLUMN "resetPasswordExpires" DATETIME;
ALTER TABLE "User" ADD COLUMN "resetPasswordToken" TEXT;
