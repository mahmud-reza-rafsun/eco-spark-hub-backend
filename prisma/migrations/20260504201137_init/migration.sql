/*
  Warnings:

  - You are about to drop the column `category` on the `Insight` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Insight" DROP COLUMN "category",
ADD COLUMN     "insightCategoryId" TEXT;

-- CreateTable
CREATE TABLE "InsightCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "InsightCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InsightCategory_name_key" ON "InsightCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "InsightCategory_slug_key" ON "InsightCategory"("slug");

-- AddForeignKey
ALTER TABLE "Insight" ADD CONSTRAINT "Insight_insightCategoryId_fkey" FOREIGN KEY ("insightCategoryId") REFERENCES "InsightCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
