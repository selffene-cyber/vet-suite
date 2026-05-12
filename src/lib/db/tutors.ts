import type { D1Database } from "@cloudflare/workers-types";

export async function getTutors(db: D1Database, companyId: string, search?: string, limit = 50, offset = 0) {
  if (search) {
    return db.prepare(
      "SELECT * FROM tutors WHERE company_id = ? AND (nombre_completo LIKE ? OR rut LIKE ?) ORDER BY nombre_completo LIMIT ? OFFSET ?"
    ).bind(companyId, `%${search}%`, `%${search}%`, limit, offset).all();
  }
  return db.prepare(
    "SELECT * FROM tutors WHERE company_id = ? ORDER BY nombre_completo LIMIT ? OFFSET ?"
  ).bind(companyId, limit, offset).all();
}

export async function getTutor(db: D1Database, id: string) {
  return db.prepare("SELECT * FROM tutors WHERE id = ?").bind(id).first();
}

export async function createTutor(db: D1Database, companyId: string, data: Record<string, unknown>) {
  const id = crypto.randomUUID();
  await db.prepare(
    `INSERT INTO tutors (id, company_id, nombre_completo, rut, telefono, correo, direccion, comuna, region, observaciones)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, companyId, data.nombre_completo, data.rut, data.telefono, data.correo || null, data.direccion, data.comuna, data.region, data.observaciones || null).run();
  return getTutor(db, id);
}

export async function updateTutor(db: D1Database, id: string, data: Record<string, unknown>) {
  const fields = Object.keys(data).filter(k => data[k] !== undefined);
  const values = fields.map(k => data[k]);
  const setClause = fields.map(k => `${k} = ?`).join(', ');
  await db.prepare(`UPDATE tutors SET ${setClause} WHERE id = ?`).bind(...values, id).run();
  return getTutor(db, id);
}

export async function deleteTutor(db: D1Database, id: string) {
  await db.prepare("DELETE FROM tutors WHERE id = ?").bind(id).run();
}