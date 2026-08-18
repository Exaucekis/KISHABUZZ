-- Arena Culture: publishable guests, video thumbnails, featured videos

ALTER TABLE "ArenaGuest" ADD COLUMN "visible" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "ArenaGuest" ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "ArenaGuest_visible_featured_idx" ON "ArenaGuest"("visible", "featured");

ALTER TABLE "ArenaShow" ADD COLUMN "videoThumbnail" TEXT NOT NULL DEFAULT '';

ALTER TABLE "MediaAsset" ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT false;
