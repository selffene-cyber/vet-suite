import type { D1Database } from "@cloudflare/workers-types";

export async function getVeterinarians(db: D1Database, companyId: string) {
  return db.prepare("SELECT * FROM veterinarians WHERE company_id = ? AND estado = 'active' ORDER BY nombre_completo").bind(companyId).all();
}

export async function getVeterinarian(db: D1Database, id: string) {
  return db.prepare("SELECT * FROM veterinarians WHERE id = ?").bind(id).first();
}

export async function createVeterinarian(db: D1Database, companyId: string, data: Record<string, unknown>) {
  const id = crypto.randomUUID();
  await db.prepare(
    `INSERT INTO veterinarians (id, company_id, user_id, nombre_completo, rut, nro_registro_profesional, especialidad, correo, telefono, firma_url, timbre_url, es_independiente, estado)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, companyId, data.user_id || null, data.nombre_completo, data.rut, data.nro_registro_profesional, data.especialidad || null, data.correo, data.telefono, data.firma_url || null, data.timbre_url || null, data.es_independiente ? 1 : 0, 'active').run();
  return getVeterinarian(db, id);
}

export async function updateVeterinarian(db: D1Database, id: string, data: Record<string, unknown>) {
  const fields = Object.keys(data).filter(k => data[k] !== undefined);
  const values = fields.map(k => data[k]);
  const setClause = fields.map(k => `${k} = ?`).join(', ');
  await db.prepare(`UPDATE veterinarians SET ${setClause} WHERE id = ?`).bind(...values, id).run();
  return getVeterinarian(db, id);
}