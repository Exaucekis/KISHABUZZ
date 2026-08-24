// prisma.config.ts
import { defineConfig } from "@prisma/config";
import "dotenv/config";

export default defineConfig({
  // Path to your Prisma schema
  schema: "prisma/schema.prisma",
  // Database connection URL
  datasource: {
    url: process.env.DATABASE_URL,
  },
  // Optional: specify the engine (required for Prisma 7+)
  engine: "classic",
});
