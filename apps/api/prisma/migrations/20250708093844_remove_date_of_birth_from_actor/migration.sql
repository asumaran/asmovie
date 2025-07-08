/*
  Warnings:

  - You are about to drop the column `dateOfBirth` on the `actors` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "actors_dateOfBirth_idx";

-- AlterTable
ALTER TABLE "actors" DROP COLUMN "dateOfBirth";
