import type { D1Database } from "@cloudflare/workers-types";

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const inputHash = await hashPassword(password);
  return inputHash === hash;
}

export async function authenticateUser(db: D1Database, correo: string, password: string) {
  const user = await db
    .prepare("SELECT u.*, v.id as vet_id FROM users u LEFT JOIN veterinarians v ON v.user_id = u.id WHERE u.correo = ? AND u.estado = 'active'")
    .bind(correo)
    .first();

  if (!user) return null;

  const passwordHash = (user as Record<string, unknown>).password_hash as string | null;
  if (!passwordHash) return null;

  const valid = await verifyPassword(password, passwordHash);
  if (!valid) return null;

  return user;
}

export async function createSession(db: D1Database, userId: string): Promise<string> {
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  await db
    .prepare("INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)")
    .bind(crypto.randomUUID(), userId, token, expiresAt)
    .run();
  return token;
}

export async function verifySession(db: D1Database, token: string) {
  const session = await db
    .prepare("SELECT s.*, u.* FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ? AND s.expires_at > datetime('now')")
    .bind(token)
    .first();
  if (!session) return null;
  return session;
}

export async function deleteSession(db: D1Database, token: string) {
  await db.prepare("DELETE FROM sessions WHERE token = ?").bind(token).run();
}

export async function logAudit(
  db: D1Database,
  companyId: string,
  userId: string | null,
  userRole: string | null,
  action: string,
  entity: string,
  entityId: string | null,
  ipAddress: string,
  details?: string
) {
  await db
    .prepare(
      "INSERT INTO audit_logs (id, company_id, user_id, user_rol, accion, entidad, entidad_id, detalles, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(
      crypto.randomUUID(),
      companyId,
      userId,
      userRole,
      action,
      entity,
      entityId,
      details || null,
      ipAddress
    )
    .run();
}

export { hashPassword };