-- Public likes for the artists shown in the homepage spotlight.

CREATE TABLE "SpotlightArtistLike" (
    "artistId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpotlightArtistLike_pkey" PRIMARY KEY ("artistId", "userId")
);

CREATE INDEX "SpotlightArtistLike_userId_createdAt_idx" ON "SpotlightArtistLike"("userId", "createdAt");

ALTER TABLE "SpotlightArtistLike" ADD CONSTRAINT "SpotlightArtistLike_artistId_fkey"
  FOREIGN KEY ("artistId") REFERENCES "SpotlightArtist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SpotlightArtistLike" ADD CONSTRAINT "SpotlightArtistLike_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
