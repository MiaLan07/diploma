/*
  Warnings:

  - You are about to drop the column `roomsCuant` on the `Property` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Property" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "operationId" INTEGER NOT NULL,
    "propertyTypeId" INTEGER NOT NULL,
    "housingTypeId" INTEGER,
    "title" TEXT,
    "price" REAL NOT NULL,
    "area" REAL,
    "floor" INTEGER,
    "totalFloors" INTEGER,
    "buildingType" TEXT,
    "shortDescription" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "bargaining" BOOLEAN DEFAULT true,
    "mortgagePossible" BOOLEAN DEFAULT false,
    "maternalCapital" BOOLEAN DEFAULT false,
    "fullDescription" TEXT,
    "buildingDescription" TEXT,
    "yearBuilt" INTEGER,
    "yearBuiltDescription" TEXT,
    "hasElevator" BOOLEAN,
    "parking" TEXT,
    "environment" TEXT,
    "infrastructure" TEXT,
    "transportAccessibility" TEXT,
    "communications" TEXT,
    "renovation" TEXT,
    "legalPurity" TEXT,
    "mortgageDescription" TEXT,
    "livingDescription" TEXT,
    "condition" TEXT,
    "roomsCount" INTEGER,
    "address" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "archivedAt" DATETIME,
    "slug" TEXT,
    "totalArea" REAL,
    "livingArea" REAL,
    "kitchenArea" REAL,
    "renovationYear" INTEGER,
    "balcony" TEXT,
    "bathroom" TEXT,
    "windows" TEXT,
    "view" TEXT,
    "ownership" TEXT,
    "encumbrance" BOOLEAN DEFAULT false,
    "readyToMove" BOOLEAN DEFAULT false,
    CONSTRAINT "Property_operationId_fkey" FOREIGN KEY ("operationId") REFERENCES "Operation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Property_propertyTypeId_fkey" FOREIGN KEY ("propertyTypeId") REFERENCES "PropertyType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Property_housingTypeId_fkey" FOREIGN KEY ("housingTypeId") REFERENCES "HousingType" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Property" ("address", "archivedAt", "area", "balcony", "bargaining", "bathroom", "buildingDescription", "buildingType", "communications", "condition", "createdAt", "encumbrance", "environment", "floor", "fullDescription", "hasElevator", "housingTypeId", "id", "infrastructure", "kitchenArea", "latitude", "legalPurity", "livingArea", "livingDescription", "longitude", "maternalCapital", "mortgageDescription", "mortgagePossible", "operationId", "ownership", "parking", "price", "propertyTypeId", "readyToMove", "renovation", "renovationYear", "shortDescription", "slug", "status", "title", "totalArea", "totalFloors", "transportAccessibility", "updatedAt", "view", "windows", "yearBuilt", "yearBuiltDescription") SELECT "address", "archivedAt", "area", "balcony", "bargaining", "bathroom", "buildingDescription", "buildingType", "communications", "condition", "createdAt", "encumbrance", "environment", "floor", "fullDescription", "hasElevator", "housingTypeId", "id", "infrastructure", "kitchenArea", "latitude", "legalPurity", "livingArea", "livingDescription", "longitude", "maternalCapital", "mortgageDescription", "mortgagePossible", "operationId", "ownership", "parking", "price", "propertyTypeId", "readyToMove", "renovation", "renovationYear", "shortDescription", "slug", "status", "title", "totalArea", "totalFloors", "transportAccessibility", "updatedAt", "view", "windows", "yearBuilt", "yearBuiltDescription" FROM "Property";
DROP TABLE "Property";
ALTER TABLE "new_Property" RENAME TO "Property";
CREATE UNIQUE INDEX "Property_slug_key" ON "Property"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
