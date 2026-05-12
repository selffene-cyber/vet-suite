import type { D1Database, R2Bucket } from "@cloudflare/workers-types";

function getCloudflareContext(): { env: Record<string, unknown> } | null {
  try {
    return (globalThis as unknown as Record<symbol, unknown>)[Symbol.for("__cloudflare-context__")] as { env: Record<string, unknown> } | null;
  } catch {
    return null;
  }
}

export function getEnv(): Record<string, unknown> {
  const ctx = getCloudflareContext();
  if (ctx?.env) return ctx.env;
  if (typeof globalThis.process?.env !== "undefined") return globalThis.process.env as Record<string, unknown>;
  return {};
}

export function getD1(): D1Database {
  const env = getEnv();
  return env.DB as D1Database;
}

export function getR2(): R2Bucket {
  const env = getEnv();
  return env.STORAGE as R2Bucket;
}

export function getJwtSecret(): string {
  const env = getEnv();
  return (env.JWT_SECRET as string) || "default-secret-change-me";
}

export type Env = {
  DB: D1Database;
  STORAGE: R2Bucket;
  JWT_SECRET: string;
};