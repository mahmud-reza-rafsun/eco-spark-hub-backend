/*
  Warnings:

  - The primary key for the `Insight` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Insight" DROP CONSTRAINT "Insight_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Insight_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Insight_id_seq";
