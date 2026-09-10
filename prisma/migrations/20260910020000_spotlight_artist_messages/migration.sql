-- Private messages created when a member shares a Spotlight artist image.

CREATE TABLE "SpotlightArtistMessage" (
    "id" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "image" TEXT NOT NULL DEFAULT '',
    "sender" TEXT NOT NULL DEFAULT 'USER',
    "adminName" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpotlightArtistMessage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SpotlightArtistMessage_userId_artistId_createdAt_idx"
  ON "SpotlightArtistMessage"("userId", "artistId", "createdAt");
CREATE INDEX "SpotlightArtistMessage_artistId_createdAt_idx"
  ON "SpotlightArtistMessage"("artistId", "createdAt");

ALTER TABLE "SpotlightArtistMessage" ADD CONSTRAINT "SpotlightArtistMessage_artistId_fkey"
  FOREIGN KEY ("artistId") REFERENCES "SpotlightArtist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SpotlightArtistMessage" ADD CONSTRAINT "SpotlightArtistMessage_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
