/*
  Warnings:

  - You are about to drop the column `country` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `industryType` on the `User` table. All the data in the column will be lost.
  - Added the required column `job` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "country",
DROP COLUMN "industryType",
ADD COLUMN     "job" TEXT NOT NULL;
