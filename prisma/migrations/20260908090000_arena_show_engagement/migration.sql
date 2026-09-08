-- Likes and comments shown on Arena episodes and the next-guest spotlight.

CREATE TABLE "ArenaShowLike" (
    "showId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArenaShowLike_pkey" PRIMARY KEY ("showId", "userId")
);

CREATE TABLE "ArenaShowComment" (
    "id" TEXT NOT NULL,
    "showId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArenaShowComment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ArenaShowLike_userId_createdAt_idx" ON "ArenaShowLike"("userId", "createdAt");
CREATE INDEX "ArenaShowComment_showId_createdAt_idx" ON "ArenaShowComment"("showId", "createdAt");
CREATE INDEX "ArenaShowComment_userId_createdAt_idx" ON "ArenaShowComment"("userId", "createdAt");

ALTER TABLE "ArenaShowLike" ADD CONSTRAINT "ArenaShowLike_showId_fkey"
  FOREIGN KEY ("showId") REFERENCES "ArenaShow"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ArenaShowLike" ADD CONSTRAINT "ArenaShowLike_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ArenaShowComment" ADD CONSTRAINT "ArenaShowComment_showId_fkey"
  FOREIGN KEY ("showId") REFERENCES "ArenaShow"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ArenaShowComment" ADD CONSTRAINT "ArenaShowComment_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
