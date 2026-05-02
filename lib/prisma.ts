import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is missing.");
  }

  const dbUrl = new URL(connectionString);
  const sslAccept = dbUrl.searchParams.get("sslaccept");
  const shouldAllowInvalidCerts =
    dbUrl.hostname.endsWith(".proxy.rlwy.net") ||
    sslAccept === "accept_invalid_certs" ||
    process.env.PG_SSL_REJECT_UNAUTHORIZED === "false";

  const pool = new Pool({
    connectionString,
    ssl: shouldAllowInvalidCerts ? { rejectUnauthorized: false } : undefined,
  });

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
