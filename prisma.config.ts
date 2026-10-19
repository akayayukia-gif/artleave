import "dotenv/config";
import { defineConfig } from "prisma/config";

// Prisma 7 では .env を自動で読まないため、先頭で dotenv を読み込む。
// DATABASE_URL はマイグレーション時にだけ必要（prisma generate やビルドでは不要）。
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
