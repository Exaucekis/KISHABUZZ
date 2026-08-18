-- Focal point for cover images (object-position)

ALTER TABLE "Article" ADD COLUMN "coverFocus" TEXT NOT NULL DEFAULT '50% 50%';
ALTER TABLE "PortfolioItem" ADD COLUMN "coverFocus" TEXT NOT NULL DEFAULT '50% 50%';
