-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Property" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "operationId" INTEGER NOT NULL,
    "propertyTypeId" INTEGER NOT NULL,
    "housingTypeId" INTEGER,
    "price" REAL NOT NULL,
    "area" REAL,
    "condition" TEXT,
    "parking" TEXT,
    "rooms" INTEGER,
    "floor" INTEGER,
    "hasElevator" BOOLEAN,
    "yearBuilt" INTEGER,
    "shortDescription" TEXT,
    "fullDescription" TEXT,
    "address" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "archivedAt" DATETIME,
    CONSTRAINT "Property_operationId_fkey" FOREIGN KEY ("operationId") REFERENCES "Operation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Property_propertyTypeId_fkey" FOREIGN KEY ("propertyTypeId") REFERENCES "PropertyType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Property_housingTypeId_fkey" FOREIGN KEY ("housingTypeId") REFERENCES "HousingType" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Property" ("address", "area", "condition", "createdAt", "floor", "fullDescription", "hasElevator", "housingTypeId", "id", "latitude", "longitude", "operationId", "parking", "price", "propertyTypeId", "rooms", "shortDescription", "updatedAt", "yearBuilt") SELECT "address", "area", "condition", "createdAt", "floor", "fullDescription", "hasElevator", "housingTypeId", "id", "latitude", "longitude", "operationId", "parking", "price", "propertyTypeId", "rooms", "shortDescription", "updatedAt", "yearBuilt" FROM "Property";
DROP TABLE "Property";
ALTER TABLE "new_Property" RENAME TO "Property";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
