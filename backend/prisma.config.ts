import { defineConfig } from "@prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Prisma 7 requires url here, NOT in schema.prisma
    url: process.env.DATABASE_URL!,
  },
});
