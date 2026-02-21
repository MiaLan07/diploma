/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Property` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Property" ADD COLUMN "balcony" TEXT;
ALTER TABLE "Property" ADD COLUMN "bargaining" BOOLEAN DEFAULT true;
ALTER TABLE "Property" ADD COLUMN "bathroom" TEXT;
ALTER TABLE "Property" ADD COLUMN "encumbrance" BOOLEAN DEFAULT false;
ALTER TABLE "Property" ADD COLUMN "kitchenArea" REAL;
ALTER TABLE "Property" ADD COLUMN "livingArea" REAL;
ALTER TABLE "Property" ADD COLUMN "mortgagePossible" BOOLEAN DEFAULT false;
ALTER TABLE "Property" ADD COLUMN "ownership" TEXT;
ALTER TABLE "Property" ADD COLUMN "readyToMove" BOOLEAN DEFAULT false;
ALTER TABLE "Property" ADD COLUMN "renovation" TEXT;
ALTER TABLE "Property" ADD COLUMN "renovationYear" INTEGER;
ALTER TABLE "Property" ADD COLUMN "slug" TEXT;
ALTER TABLE "Property" ADD COLUMN "totalArea" REAL;
ALTER TABLE "Property" ADD COLUMN "totalFloors" INTEGER;
ALTER TABLE "Property" ADD COLUMN "view" TEXT;
ALTER TABLE "Property" ADD COLUMN "windows" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Property_slug_key" ON "Property"("slug");
