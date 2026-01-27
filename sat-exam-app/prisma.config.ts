import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // For migrations and dev, use DIRECT_URL (port 5432) to skip pooler limitations
    url: process.env["DIRECT_URL"] || process.env["DATABASE_URL"],
  },
});
