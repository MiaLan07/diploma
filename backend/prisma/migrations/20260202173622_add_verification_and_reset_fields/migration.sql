-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "phone" TEXT,
    "newEmail" TEXT,
    "emailVerificationCode" TEXT,
    "emailVerificationExpires" DATETIME,
    "emailVerificationAttempts" INTEGER NOT NULL DEFAULT 0,
    "resetPasswordToken" TEXT,
    "resetPasswordExpires" DATETIME,
    "resetPasswordAttempts" INTEGER NOT NULL DEFAULT 0,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "email", "emailVerificationCode", "emailVerificationExpires", "firstName", "id", "isAdmin", "lastName", "newEmail", "passwordHash", "phone", "resetPasswordExpires", "resetPasswordToken", "updatedAt") SELECT "createdAt", "email", "emailVerificationCode", "emailVerificationExpires", "firstName", "id", "isAdmin", "lastName", "newEmail", "passwordHash", "phone", "resetPasswordExpires", "resetPasswordToken", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
