import type { D1Database } from "@cloudflare/workers-types";

export async function getUsers(db: D1Database, companyId: string) {
  return db.prepare("SELECT * FROM users WHERE company_id = ? ORDER BY nombre_completo").bind(companyId).all();
}

export async function getUser(db: D1Database, id: string) {
  return db.prepare("SELECT * FROM users WHERE id = ?").bind(id).first();
}

export async function getUserByCorreo(db: D1Database, correo: string) {
  return db.prepare("SELECT * FROM users WHERE correo = ?").bind(correo).first();
}

export async function createUser(db: D1Database, companyId: string, data: Record<string, unknown>) {
  const id = crypto.randomUUID();
  await db.prepare(
    `INSERT INTO users (id, company_id, nombre_completo, rut, correo, telefono, cargo, rol, estado, requiere_cambio_password, auth_2fa_habilitada, veterinarian_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, companyId, data.nombre_completo, data.rut, data.correo, data.telefono || null, data.cargo || null, data.rol || 'assistant', 'active', 1, 0, data.veterinarian_id || null).run();
  return getUser(db, id);
}

export async function updateUser(db: D1Database, id: string, data: Record<string, unknown>) {
  const fields = Object.keys(data).filter(k => data[k] !== undefined);
  const values = fields.map(k => data[k]);
  const setClause = fields.map(k => `${k} = ?`).join(', ');
  await db.prepare(`UPDATE users SET ${setClause} WHERE id = ?`).bind(...values, id).run();
  return getUser(db, id);
}

export async function revokeUser(db: D1Database, id: string) {
  await db.prepare("UPDATE users SET estado = 'suspended' WHERE id = ?").bind(id).run();
}