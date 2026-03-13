-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "pinnedAt" TIMESTAMP(3),
ADD COLUMN     "starredAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "starredAt" TIMESTAMP(3);
