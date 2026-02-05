-- AlterEnum
ALTER TYPE "TaskStatus" ADD VALUE 'in_review';

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "priority" TEXT NOT NULL DEFAULT 'Medium',
ADD COLUMN     "subtasks" JSONB;
