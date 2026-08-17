-- CreateSchema
-- User roles: SUPERADMIN | ADMIN | EDITOR | AUTHOR | USER

UPDATE "User" SET "role" = 'SUPERADMIN' WHERE "role" = 'ADMIN';

ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'USER';
