ALTER TABLE "Notification"
ADD COLUMN "starredAt" TIMESTAMP(3);

CREATE INDEX "Notification_starredAt_idx" ON "Notification"("starredAt");
