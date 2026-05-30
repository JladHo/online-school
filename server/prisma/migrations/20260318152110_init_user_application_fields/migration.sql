/*
  Warnings:

  - You are about to drop the column `firstName` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `middleName` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `middleName` on the `User` table. All the data in the column will be lost.
  - Added the required column `parentFirstName` to the `Application` table without a default value. This is not possible if the table is not empty.
  - Added the required column `parentLastName` to the `Application` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studentFirstName` to the `Application` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studentLastName` to the `Application` table without a default value. This is not possible if the table is not empty.
  - Added the required column `parentFirstName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `parentLastName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studentFirstName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studentLastName` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Application" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "parentLastName" TEXT NOT NULL,
    "parentFirstName" TEXT NOT NULL,
    "studentLastName" TEXT NOT NULL,
    "studentFirstName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "courseId" INTEGER NOT NULL,
    CONSTRAINT "Application_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Application" ("courseId", "email", "id", "phone", "status") SELECT "courseId", "email", "id", "phone", "status" FROM "Application";
DROP TABLE "Application";
ALTER TABLE "new_Application" RENAME TO "Application";
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "parentLastName" TEXT NOT NULL,
    "parentFirstName" TEXT NOT NULL,
    "studentLastName" TEXT NOT NULL,
    "studentFirstName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "birthday" DATETIME
);
INSERT INTO "new_User" ("birthday", "email", "id", "password", "phone", "role") SELECT "birthday", "email", "id", "password", "phone", "role" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
