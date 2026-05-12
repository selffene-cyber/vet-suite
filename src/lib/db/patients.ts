import type { D1Database } from "@cloudflare/workers-types";

export async function getPatients(db: D1Database, companyId: string, search?: string, limit = 50, offset = 0) {
  if (search) {
    return db.prepare(
      "SELECT p.*, t.nombre_completo as tutor_nombre FROM patients p JOIN tutors t ON t.id = p.tutor_id WHERE p.company_id = ? AND (p.nombre LIKE ? OR t.nombre_completo LIKE ?) ORDER BY p.nombre LIMIT ? OFFSET ?"
    ).bind(companyId, `%${search}%`, `%${search}%`, limit, offset).all();
  }
  return db.prepare(
    "SELECT p.*, t.nombre_completo as tutor_nombre FROM patients p JOIN tutors t ON t.id = p.tutor_id WHERE p.company_id = ? ORDER BY p.nombre LIMIT ? OFFSET ?"
  ).bind(companyId, limit, offset).all();
}

export async function getPatient(db: D1Database, id: string) {
  return db.prepare("SELECT * FROM patients WHERE id = ?").bind(id).first();
}

export async function createPatient(db: D1Database, companyId: string, data: Record<string, unknown>) {
  const id = crypto.randomUUID();
  await db.prepare(
    `INSERT INTO patients (id, company_id, tutor_id, nombre, especie, raza, sexo, fecha_nacimiento, edad, peso, color, microchip, foto_url, alergias, condiciones_relevantes, historial_resumen)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, companyId, data.tutor_id, data.nombre, data.especie, data.raza, data.sexo || 'desconocido', data.fecha_nacimiento || null, data.edad || null, data.peso || null, data.color || null, data.microchip || null, data.foto_url || null, data.alergias || null, data.condiciones_relevantes || null, data.historial_resumen || null).run();
  return getPatient(db, id);
}

export async function updatePatient(db: D1Database, id: string, data: Record<string, unknown>) {
  const fields = Object.keys(data).filter(k => data[k] !== undefined);
  const values = fields.map(k => data[k]);
  const setClause = fields.map(k => `${k} = ?`).join(', ');
  await db.prepare(`UPDATE patients SET ${setClause} WHERE id = ?`).bind(...values, id).run();
  return getPatient(db, id);
}