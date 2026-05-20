import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool, type PoolConfig } from "pg";

type PrismaGlobal = {
  prisma?: PrismaClient;
  pool?: Pool;
};

const globalForPrisma = globalThis as unknown as PrismaGlobal;

const RETRYABLE_DB_ERROR =
  /Server has closed the connection|ECONNRESET|ECONNREFUSED|ETIMEDOUT|Connection terminated|connection timeout|Connection terminated unexpectedly|P1001|P1017/i;

function isLocalHost(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

function isPrivateHost(hostname: string) {
  return hostname.endsWith(".railway.internal") || hostname.endsWith(".internal");
}

function resolvePoolSsl(dbUrl: URL): PoolConfig["ssl"] {
  if (isLocalHost(dbUrl.hostname)) return undefined;

  const sslMode = dbUrl.searchParams.get("sslmode");
  if (sslMode === "disable") return undefined;

  const relaxVerification =
    dbUrl.hostname.endsWith(".proxy.rlwy.net") ||
    dbUrl.hostname.endsWith(".railway.app") ||
    dbUrl.hostname.endsWith(".neon.tech") ||
    dbUrl.hostname.includes("supabase") ||
    dbUrl.searchParams.get("sslaccept") === "accept_invalid_certs" ||
    process.env.PG_SSL_REJECT_UNAUTHORIZED === "false";

  // Remote Postgres on serverless needs TLS. Railway/Neon certs often need relaxed
  // verification when sslmode is stripped from the URL for pg Pool control.
  if (relaxVerification || !sslMode || sslMode === "require" || sslMode === "prefer") {
    return { rejectUnauthorized: !relaxVerification };
  }

  return { rejectUnauthorized: true };
}

function normalizeDatabaseUrl(connectionString: string) {
  const dbUrl = new URL(connectionString);

  // Keep SSL behavior under Pool.ssl. If sslmode remains in the URL, newer pg
  // parsing semantics can force stricter verification first.
  dbUrl.searchParams.delete("sslmode");
  dbUrl.searchParams.delete("sslaccept");
  dbUrl.searchParams.delete("uselibpqcompat");

  return dbUrl;
}

function getConnectionString() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is missing.");
  }
  return connectionString;
}

function assertPublicHost(dbUrl: URL) {
  if (isPrivateHost(dbUrl.hostname)) {
    throw new Error(
      "DATABASE_URL uses a private database host that Vercel cannot reach. Use your provider's public connection URL (for Railway: the *.proxy.rlwy.net URL).",
    );
  }
}

function createPool(connectionString: string) {
  const dbUrl = normalizeDatabaseUrl(connectionString);
  assertPublicHost(dbUrl);

  return new Pool({
    connectionString: dbUrl.toString(),
    max: Number(process.env.PG_POOL_MAX ?? 1),
    idleTimeoutMillis: Number(process.env.PG_IDLE_TIMEOUT_MS ?? 5_000),
    connectionTimeoutMillis: Number(process.env.PG_CONNECTION_TIMEOUT_MS ?? 10_000),
    allowExitOnIdle: true,
    ssl: resolvePoolSsl(dbUrl),
  });
}

function createPrismaClient(pool: Pool) {
  return new PrismaClient({ adapter: new PrismaPg(pool) });
}

export async function disconnectDb() {
  const pool = globalForPrisma.pool;
  globalForPrisma.prisma = undefined;
  globalForPrisma.pool = undefined;
  if (pool) {
    await pool.end().catch(() => undefined);
  }
}

export function getPrisma(): PrismaClient {
  const connectionString = getConnectionString();

  if (!globalForPrisma.pool) {
    globalForPrisma.pool = createPool(connectionString);
  }
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient(globalForPrisma.pool);
  }

  return globalForPrisma.prisma;
}

export function isRetryableDbError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return RETRYABLE_DB_ERROR.test(message);
}

export async function dbQuery<T>(operation: (client: PrismaClient) => Promise<T>): Promise<T> {
  try {
    return await operation(getPrisma());
  } catch (err) {
    if (!isRetryableDbError(err)) throw err;
    console.warn("Database connection failed, retrying once after reconnect", err);
    await disconnectDb();
    return await operation(getPrisma());
  }
}
