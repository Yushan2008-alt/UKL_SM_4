import "dotenv/config";
import { defineConfig } from "prisma/config";

function isLocalhost(url: string): boolean {
  return /localhost|127\.0\.0\.1|::1/.test(url)
}

function getDatabaseUrl(): string {
  const url =
    process.env["DATABASE_URL"] ||
    process.env["POSTGRES_URL"] ||
    process.env["PG_DATABASE_URL"] ||
    process.env["RAILWAY_DATABASE_URL"]

  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. " +
      "Railway: add a PostgreSQL service and link it to this service. " +
      "Local: set DATABASE_URL in .env file.",
    )
  }

  if (!isLocalhost(url) && !url.includes("sslmode")) {
    const sep = url.includes("?") ? "&" : "?"
    return url + sep + "sslmode=require"
  }

  return url
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    url: getDatabaseUrl(),
  },
});
