-- Accessible image descriptions for covers, media, hero

ALTER TABLE "SiteSetting" ADD COLUMN "heroAlt" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Article" ADD COLUMN "coverAlt" TEXT NOT NULL DEFAULT '';
ALTER TABLE "PortfolioItem" ADD COLUMN "coverAlt" TEXT NOT NULL DEFAULT '';
ALTER TABLE "MediaAsset" ADD COLUMN "alt" TEXT NOT NULL DEFAULT '';
