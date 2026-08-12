-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSetting" (
    "id" TEXT NOT NULL DEFAULT 'main',
    "siteTitle" TEXT NOT NULL DEFAULT 'KISHA BUZZ',
    "tagline" TEXT NOT NULL DEFAULT '',
    "aboutShort" TEXT NOT NULL DEFAULT '',
    "aboutLong" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '0974105940',
    "email" TEXT NOT NULL DEFAULT '',
    "address" TEXT NOT NULL DEFAULT '',
    "whatsappEnabled" BOOLEAN NOT NULL DEFAULT false,
    "socialFacebook" TEXT NOT NULL DEFAULT '',
    "socialInstagram" TEXT NOT NULL DEFAULT '',
    "socialYoutube" TEXT NOT NULL DEFAULT '',
    "socialX" TEXT NOT NULL DEFAULT '',
    "socialTiktok" TEXT NOT NULL DEFAULT '',
    "metaTitle" TEXT NOT NULL DEFAULT 'KISHA BUZZ - Media, culture & contenus',
    "metaDescription" TEXT NOT NULL DEFAULT 'Plateforme media professionnelle : chroniques, publications, portfolio et Arena Culture.',
    "heroImage" TEXT NOT NULL DEFAULT '',
    "heroVideo" TEXT NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "type" TEXT NOT NULL DEFAULT 'publication',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL DEFAULT '',
    "coverImage" TEXT NOT NULL DEFAULT '',
    "contentType" TEXT NOT NULL DEFAULT 'ARTICLE',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "scheduledAt" TIMESTAMP(3),
    "metaTitle" TEXT NOT NULL DEFAULT '',
    "metaDescription" TEXT NOT NULL DEFAULT '',
    "views" INTEGER NOT NULL DEFAULT 0,
    "authorId" TEXT,
    "authorName" TEXT NOT NULL DEFAULT 'KISHA BUZZ',
    "categoryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleTag" (
    "articleId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    CONSTRAINT "ArticleTag_pkey" PRIMARY KEY ("articleId","tagId")
);

-- CreateTable
CREATE TABLE "ArenaSeason" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ArenaSeason_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArenaGuest" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "profession" TEXT NOT NULL DEFAULT '',
    "bio" TEXT NOT NULL DEFAULT '',
    "photo" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ArenaGuest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArenaShow" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "airDate" TIMESTAMP(3),
    "airTime" TEXT NOT NULL DEFAULT '',
    "poster" TEXT NOT NULL DEFAULT '',
    "videoUrl" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isGuestOfWeek" BOOLEAN NOT NULL DEFAULT false,
    "seasonId" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ArenaShow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArenaShowGuest" (
    "showId" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'invite',
    CONSTRAINT "ArenaShowGuest_pkey" PRIMARY KEY ("showId","guestId")
);

-- CreateTable
CREATE TABLE "PortfolioItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "type" TEXT NOT NULL DEFAULT 'MEDIA_ACTIVITY',
    "date" TIMESTAMP(3),
    "location" TEXT NOT NULL DEFAULT '',
    "client" TEXT NOT NULL DEFAULT '',
    "coverImage" TEXT NOT NULL DEFAULT '',
    "link" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PortfolioItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "kind" TEXT NOT NULL DEFAULT 'IMAGE',
    "url" TEXT NOT NULL,
    "thumbnail" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT '',
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "date" TIMESTAMP(3),
    "arenaShowId" TEXT,
    "portfolioItemId" TEXT,
    "albumId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhotoAlbum" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "guestName" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "coverImage" TEXT NOT NULL DEFAULT '',
    "emissionLabel" TEXT NOT NULL DEFAULT 'Arena Grand Culture',
    "date" TIMESTAMP(3),
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PhotoAlbum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Partner" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "logo" TEXT NOT NULL DEFAULT '',
    "website" TEXT NOT NULL DEFAULT '',
    "project" TEXT NOT NULL DEFAULT '',
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Partner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactRequest" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "organization" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "collaborationType" TEXT NOT NULL DEFAULT 'OTHER',
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ContactRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Domain" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "icon" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Domain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageContent" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "body" TEXT NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PageContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_slug_key" ON "Tag"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Article_slug_key" ON "Article"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ArenaSeason_number_year_key" ON "ArenaSeason"("number", "year");

-- CreateIndex
CREATE UNIQUE INDEX "ArenaGuest_slug_key" ON "ArenaGuest"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ArenaShow_slug_key" ON "ArenaShow"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "PortfolioItem_slug_key" ON "PortfolioItem"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "PhotoAlbum_slug_key" ON "PhotoAlbum"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Partner_slug_key" ON "Partner"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Domain_slug_key" ON "Domain"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "PageContent_key_key" ON "PageContent"("key");

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleTag" ADD CONSTRAINT "ArticleTag_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleTag" ADD CONSTRAINT "ArticleTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArenaShow" ADD CONSTRAINT "ArenaShow_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "ArenaSeason"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArenaShowGuest" ADD CONSTRAINT "ArenaShowGuest_showId_fkey" FOREIGN KEY ("showId") REFERENCES "ArenaShow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArenaShowGuest" ADD CONSTRAINT "ArenaShowGuest_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "ArenaGuest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_arenaShowId_fkey" FOREIGN KEY ("arenaShowId") REFERENCES "ArenaShow"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_portfolioItemId_fkey" FOREIGN KEY ("portfolioItemId") REFERENCES "PortfolioItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "PhotoAlbum"("id") ON DELETE SET NULL ON UPDATE CASCADE;
