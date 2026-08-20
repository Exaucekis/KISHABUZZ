-- Lieu du plateau + événement billets optionnel pour le calendrier Arena

ALTER TABLE "ArenaShow" ADD COLUMN "venueName" TEXT NOT NULL DEFAULT '';
ALTER TABLE "ArenaShow" ADD COLUMN "eventId" TEXT;

CREATE INDEX "ArenaShow_status_airDate_idx" ON "ArenaShow"("status", "airDate");
CREATE INDEX "ArenaShow_eventId_idx" ON "ArenaShow"("eventId");

ALTER TABLE "ArenaShow" ADD CONSTRAINT "ArenaShow_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;
