-- Arena Culture alert subscribers (email and/or WhatsApp) + one dispatch per show/kind

CREATE TABLE "ArenaAlertSubscriber" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "whatsapp" TEXT NOT NULL DEFAULT '',
    "emailStatus" TEXT NOT NULL DEFAULT 'NONE',
    "whatsappStatus" TEXT NOT NULL DEFAULT 'NONE',
    "source" TEXT NOT NULL DEFAULT 'arena',
    "unsubscribeToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArenaAlertSubscriber_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ArenaAlertSubscriber_email_key" ON "ArenaAlertSubscriber"("email");
CREATE UNIQUE INDEX "ArenaAlertSubscriber_unsubscribeToken_key" ON "ArenaAlertSubscriber"("unsubscribeToken");
CREATE UNIQUE INDEX "ArenaAlertSubscriber_whatsapp_key" ON "ArenaAlertSubscriber"("whatsapp") WHERE "whatsapp" <> '';
CREATE INDEX "ArenaAlertSubscriber_emailStatus_idx" ON "ArenaAlertSubscriber"("emailStatus");
CREATE INDEX "ArenaAlertSubscriber_whatsappStatus_whatsapp_idx" ON "ArenaAlertSubscriber"("whatsappStatus", "whatsapp");

CREATE TABLE "ArenaAlertDispatch" (
    "id" TEXT NOT NULL,
    "showId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "emailSent" INTEGER NOT NULL DEFAULT 0,
    "emailFailed" INTEGER NOT NULL DEFAULT 0,
    "whatsappSent" INTEGER NOT NULL DEFAULT 0,
    "whatsappFailed" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "errorNote" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArenaAlertDispatch_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ArenaAlertDispatch_showId_kind_key" ON "ArenaAlertDispatch"("showId", "kind");
CREATE INDEX "ArenaAlertDispatch_createdAt_idx" ON "ArenaAlertDispatch"("createdAt");

ALTER TABLE "ArenaAlertDispatch" ADD CONSTRAINT "ArenaAlertDispatch_showId_fkey" FOREIGN KEY ("showId") REFERENCES "ArenaShow"("id") ON DELETE CASCADE ON UPDATE CASCADE;
