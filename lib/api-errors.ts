/**
 * Translate a thrown DB / Prisma error into a short, user-readable string
 * suitable for returning in a JSON 500 response.
 *
 * The full stack is still logged server-side via console.error.
 */
export function describeDbError(err: unknown): string {
  if (!process.env.DATABASE_URL) {
    return "Database is not configured (DATABASE_URL is missing). For local dev: copy .env.example to .env.local, paste your Postgres URL from Vercel → Settings → Environment Variables, then restart npm run dev.";
  }

  const message = err instanceof Error ? err.message : String(err);

  // Common Prisma "table does not exist" signal — the schema hasn't been
  // pushed/migrated to the target database yet.
  if (
    /relation .* does not exist/i.test(message) ||
    /table .* does not exist/i.test(message) ||
    /P2021/.test(message) // PrismaClientKnownRequestError: table does not exist
  ) {
    return "Database is reachable but the schema hasn't been applied yet. Run `npx prisma db push` against the production DATABASE_URL.";
  }

  if (/private database host that Vercel cannot reach/i.test(message)) {
    return message;
  }

  if (/Server has closed the connection|Connection terminated unexpectedly|P1001|P1017/i.test(message)) {
    return "Database connection failed. Check that DATABASE_URL uses your provider's public URL, the database is running, and redeploy after updating env vars.";
  }

  if (/ECONNREFUSED|ENOTFOUND|ETIMEDOUT|self.signed certificate/i.test(message)) {
    return `Database is unreachable: ${message}`;
  }

  return `Server error: ${message}`;
}
