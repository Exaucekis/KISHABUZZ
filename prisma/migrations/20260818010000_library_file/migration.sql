-- Media library: reuse uploaded files across the CMS

CREATE TABLE "LibraryFile" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'IMAGE',
    "title" TEXT NOT NULL DEFAULT '',
    "folder" TEXT NOT NULL DEFAULT 'media',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LibraryFile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LibraryFile_url_key" ON "LibraryFile"("url");
CREATE INDEX "LibraryFile_createdAt_idx" ON "LibraryFile"("createdAt");
