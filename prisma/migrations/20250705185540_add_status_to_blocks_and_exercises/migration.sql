/*
  Warnings:

  - Added the required column `status` to the `block_exercises` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `session_blocks` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "block_exercises" ADD COLUMN     "status" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "session_blocks" ADD COLUMN     "status" TEXT NOT NULL;
