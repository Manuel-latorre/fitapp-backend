/*
  Warnings:

  - You are about to drop the column `plan_id` on the `plan_sessions` table. All the data in the column will be lost.
  - Added the required column `week_id` to the `plan_sessions` table without a default value. This is not possible if the table is not empty.

*/

-- CreateTable
CREATE TABLE "weeks" (
    "id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weeks_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "weeks" ADD CONSTRAINT "weeks_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate existing data: Create a default week for each plan that has sessions
INSERT INTO "weeks" ("id", "plan_id", "title")
SELECT 
    gen_random_uuid() as id,
    p.id as plan_id,
    'Semana 1' as title
FROM "plans" p
WHERE EXISTS (
    SELECT 1 FROM "plan_sessions" ps WHERE ps.plan_id = p.id
);

-- Add week_id column as nullable first
ALTER TABLE "plan_sessions" ADD COLUMN "week_id" TEXT;

-- Update existing sessions to point to the created weeks
UPDATE "plan_sessions" 
SET "week_id" = w.id
FROM "weeks" w
WHERE "plan_sessions"."plan_id" = w."plan_id";

-- Now make week_id NOT NULL
ALTER TABLE "plan_sessions" ALTER COLUMN "week_id" SET NOT NULL;

-- Drop the old foreign key constraint and column
ALTER TABLE "plan_sessions" DROP CONSTRAINT "plan_sessions_plan_id_fkey";
ALTER TABLE "plan_sessions" DROP COLUMN "plan_id";

-- AddForeignKey
ALTER TABLE "plan_sessions" ADD CONSTRAINT "plan_sessions_week_id_fkey" FOREIGN KEY ("week_id") REFERENCES "weeks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
