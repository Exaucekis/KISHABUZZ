-- Story-style likes for the homepage cover and public Arena photos.

CREATE TABLE "FeaturedImageLike" (
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeaturedImageLike_pkey" PRIMARY KEY ("targetType", "targetId", "userId")
);

CREATE INDEX "FeaturedImageLike_targetType_targetId_idx" ON "FeaturedImageLike"("targetType", "targetId");
CREATE INDEX "FeaturedImageLike_userId_createdAt_idx" ON "FeaturedImageLike"("userId", "createdAt");

ALTER TABLE "FeaturedImageLike" ADD CONSTRAINT "FeaturedImageLike_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
