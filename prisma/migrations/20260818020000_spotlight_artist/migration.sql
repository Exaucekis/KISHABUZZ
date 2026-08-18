-- Spotlight artists on the homepage, managed from the CMS

CREATE TABLE "SpotlightArtist" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'Artiste',
    "image" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpotlightArtist_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SpotlightArtist_slug_key" ON "SpotlightArtist"("slug");
CREATE INDEX "SpotlightArtist_visible_order_idx" ON "SpotlightArtist"("visible", "order");

INSERT INTO "SpotlightArtist" ("id", "name", "slug", "role", "image", "order", "visible", "createdAt", "updatedAt") VALUES
('cmsartistgazmawete', 'Gaz Mawete', 'gaz-mawete', 'Artiste', '/artists/gaz-mawete.jpg', 0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cmsartistfallyipupa', 'Fally Ipupa', 'fally-ipupa', 'Artiste', '/artists/fally-ipupa.jpg', 1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cmsartistinnossb001', 'Innoss''B', 'innoss-b', 'Artiste', '/artists/innoss-b.png', 2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cmsartistkoffiolom', 'Koffi Olomidé', 'koffi-olomide', 'Légende', '/artists/koffi-olomide.jpg', 3, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
