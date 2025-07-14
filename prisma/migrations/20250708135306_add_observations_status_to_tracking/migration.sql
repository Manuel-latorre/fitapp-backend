-- AlterTable
ALTER TABLE "exercise_tracking" ADD COLUMN     "observations" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending';
