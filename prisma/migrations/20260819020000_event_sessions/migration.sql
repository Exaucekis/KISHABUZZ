-- Journées d'événement (suivies ou non) + lien tarif ↔ jours payants

CREATE TABLE "EventSession" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3),
    "label" TEXT NOT NULL DEFAULT '',
    "access" TEXT NOT NULL DEFAULT 'PAID',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventSession_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "EventSession_eventId_sortOrder_idx" ON "EventSession"("eventId", "sortOrder");

ALTER TABLE "EventSession" ADD CONSTRAINT "EventSession_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "TicketTypeSession" (
    "ticketTypeId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,

    CONSTRAINT "TicketTypeSession_pkey" PRIMARY KEY ("ticketTypeId","sessionId")
);

CREATE INDEX "TicketTypeSession_sessionId_idx" ON "TicketTypeSession"("sessionId");

ALTER TABLE "TicketTypeSession" ADD CONSTRAINT "TicketTypeSession_ticketTypeId_fkey" FOREIGN KEY ("ticketTypeId") REFERENCES "TicketType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TicketTypeSession" ADD CONSTRAINT "TicketTypeSession_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "EventSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "EventSession" ("id", "eventId", "startsAt", "endsAt", "label", "access", "sortOrder", "createdAt", "updatedAt")
SELECT
  ('cs' || substr(md5(e.id || 'session'), 1, 23)),
  e.id,
  e."startsAt",
  e."endsAt",
  '',
  'PAID',
  0,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "Event" e;

INSERT INTO "TicketTypeSession" ("ticketTypeId", "sessionId")
SELECT t.id, s.id
FROM "TicketType" t
JOIN "EventSession" s ON s."eventId" = t."eventId";
