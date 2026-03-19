/*
  Warnings:

  - The values [DRAFT,UNPUBLISHED] on the enum `IdeaStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "ArchiveStatus" AS ENUM ('TRUE', 'FALSE');

-- AlterEnum
BEGIN;
CREATE TYPE "IdeaStatus_new" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
ALTER TABLE "public"."Idea" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Idea" ALTER COLUMN "status" TYPE "IdeaStatus_new" USING ("status"::text::"IdeaStatus_new");
ALTER TYPE "IdeaStatus" RENAME TO "IdeaStatus_old";
ALTER TYPE "IdeaStatus_new" RENAME TO "IdeaStatus";
DROP TYPE "public"."IdeaStatus_old";
ALTER TABLE "Idea" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterTable
ALTER TABLE "Idea" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;
