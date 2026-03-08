ALTER TABLE "Notification"
ADD COLUMN "deletedAt" TIMESTAMP(3);

CREATE INDEX "Notification_deletedAt_idx" ON "Notification"("deletedAt");
