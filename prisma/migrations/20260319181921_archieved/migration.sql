/*
  Warnings:

  - The `isDeleted` column on the `Idea` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Idea" DROP COLUMN "isDeleted",
ADD COLUMN     "isDeleted" "ArchiveStatus" NOT NULL DEFAULT 'FALSE';
