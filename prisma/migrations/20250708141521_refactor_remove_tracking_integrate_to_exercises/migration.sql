/*
  Warnings:

  - You are about to drop the `exercise_tracking` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "exercise_tracking" DROP CONSTRAINT "exercise_tracking_exercise_id_fkey";

-- DropForeignKey
ALTER TABLE "exercise_tracking" DROP CONSTRAINT "exercise_tracking_user_id_fkey";

-- AlterTable
ALTER TABLE "block_exercises" ADD COLUMN     "completed_at" TIMESTAMP(3),
ADD COLUMN     "done" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pse" TEXT,
ADD COLUMN     "rir" TEXT,
ALTER COLUMN "status" SET DEFAULT 'pending';

-- DropTable
DROP TABLE "exercise_tracking";
